import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { type Profile } from '@/lib/types';
import { 
  type ProfileHistory, 
  type SignInData, 
  type UserActivity, 
  getProfileHistory, 
  getProfileHistoryStats, 
  getSignInsOverTime, 
  getUserActivity 
} from '@/lib/domain/profiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2, ShieldAlert, BarChart3, RefreshCcw, Home, Lightbulb } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/date';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/utils/logger';

const ideaBacklog = [
  { title: 'Rate of employment', hint: 'Track employed vs open to work across cohorts and BSc/MSc.' },
  { title: 'Field change', hint: 'Measure transitions between industries or roles.' },
  { title: 'Location drift', hint: 'Map moves between cities/countries over time.' },
  { title: 'Residency persistence', hint: 'Retention at residency partners at grad/+5/+10.' },
  { title: 'Entrepreneur rate', hint: 'Share of entrepreneurs and their longevity.' },
  { title: 'Job title trends', hint: 'Most common and fastest growing titles.' },
  { title: 'Academia paths', hint: 'Who continued to academic roles beyond ISE.' },
  { title: 'Alumni participation', hint: 'Events, IAB, news, guest lecturers involvement.' },
  { title: 'Outside achievements', hint: 'Awards, publications, notable mentions.' },
  { title: 'City1/City2 + Emp1/Emp2', hint: 'Before/after comparisons for geography and employers.' },
  { title: 'Cohort splits', hint: 'Break everything down per cohort and BSc/MSc.' },
  { title: 'Biggest gawker', hint: 'Most active viewer/participant this year.' },
  { title: 'Jetsetter', hint: 'Most locations traveled or lived.' },
  { title: 'Antiloyalist', hint: 'Most employers changed over time.' },
  { title: 'Furthest vs closest to ISE', hint: 'Geo distance from campus over time.' },
  { title: 'Residency partner rankings', hint: 'Most popular/best rated RP at grad/+5/+10.' },
];

const Gawk = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [historyStats, setHistoryStats] = useState<{
    totalChanges: number;
    changesByMonth: { month: string; count: number }[];
    changesByType: { type: string; count: number }[];
    topChangedFields: { field: string; count: number }[];
  } | null>(null);
  const [signIns, setSignIns] = useState<SignInData[]>([]);
  const [history, setHistory] = useState<ProfileHistory[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        log.error('Error fetching profile in Gawk:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !profile) return;

      try {
        setAnalyticsLoading(true);
        const [stats, signInData, historyData, activity] = await Promise.all([
          getProfileHistoryStats(),
          getSignInsOverTime(90),
          getProfileHistory(),
          getUserActivity()
        ]);

        setHistoryStats(stats);
        setSignIns(signInData);
        setHistory(historyData);
        setUserActivity(activity);
      } catch (error) {
        log.error('Error loading gawk analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, profile]);

  const totalSignIns = useMemo(
    () => signIns.reduce((sum, entry) => sum + entry.count, 0),
    [signIns]
  );

  const uniqueRecentUsers = useMemo(
    () => userActivity.filter(u => u.lastSignInAt).length,
    [userActivity]
  );

  const recentHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
    return sorted.slice(0, 8);
  }, [history]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Gawk...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  if (!['Admin', 'Staff'].includes(profile.user_type)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Gawk is restricted to Staff and Admin accounts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button className="w-full" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gawk</h1>
          <p className="text-muted-foreground">
            Experimental analytics playground for alumni history, sign-ins, and mobility trends.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()} className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile changes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? '--' : historyStats?.totalChanges || 0}
            </div>
            <p className="text-xs text-muted-foreground">All-time tracked updates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sign-ins (90d)</CardTitle>
            <Loader2 className={`h-4 w-4 ${analyticsLoading ? 'animate-spin' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? '--' : totalSignIns}
            </div>
            <p className="text-xs text-muted-foreground">Total events in last 90 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent unique users</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? '--' : uniqueRecentUsers}
            </div>
            <p className="text-xs text-muted-foreground">Users with a recorded sign-in</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sign-ins over time</CardTitle>
          <CardDescription>90-day activity trend (auth events)</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : signIns.length > 0 ? (
            <ChartContainer
              config={{
                count: {
                  label: "Sign-ins",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signIns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-count)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-count)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>No sign-in data yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest profile history slices</CardTitle>
          <CardDescription>Lightweight peek at recent `profiles_history` rows</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentHistory.length > 0 ? (
            <div className="space-y-3">
              {recentHistory.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{entry.job_title || 'Role TBD'}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.company || 'Company n/a'} • {entry.city || 'City n/a'}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {entry.professional_status && (
                        <Badge variant="outline" className="text-xs">
                          {entry.professional_status}
                        </Badge>
                      )}
                      {entry.change_type && (
                        <Badge variant={entry.change_type === 'INSERT' ? 'default' : 'secondary'} className="text-xs">
                          {entry.change_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {formatDateShort(entry.changed_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No history records to preview</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Idea backlog</CardTitle>
          <CardDescription>Shortlist of comparisons and leaderboards to prototype next</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {ideaBacklog.map((idea) => (
            <div key={idea.title} className="flex items-start justify-between p-3 border rounded-lg">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-1" />
                <div>
                  <p className="font-medium">{idea.title}</p>
                  <p className="text-sm text-muted-foreground">{idea.hint}</p>
                </div>
              </div>
              <Badge variant="outline">Planned</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Gawk;
