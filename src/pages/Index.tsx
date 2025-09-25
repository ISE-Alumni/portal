import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Calendar, Newspaper } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const Index = () => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [graduationYear, setGraduationYear] = useState<string>('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      setProfile(data ?? null);
      if (data) {
        setFullName(data.full_name ?? '');
        setCity(data.city ?? '');
        setCountry(data.country ?? '');
        setGraduationYear(data.graduation_year?.toString() ?? '');
        setJobTitle(data.job_title ?? '');
        setCompany(data.company ?? '');
        setBio(data.bio ?? '');
        const anyData = data as any;
        setGithubUrl(anyData.github_url ?? '');
        setLinkedinUrl(anyData.linkedin_url ?? '');
        setTwitterUrl(anyData.twitter_url ?? '');
        setWebsiteUrl(anyData.website_url ?? '');
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload: any = {
        user_id: user.id,
        full_name: fullName || null,
        email: user.email ?? null,
        city: city || null,
        country: country || null,
        graduation_year: graduationYear ? parseInt(graduationYear, 10) : null,
        job_title: jobTitle || null,
        company: company || null,
        bio: bio || null,
        github_url: githubUrl || null,
        linkedin_url: linkedinUrl || null,
        twitter_url: twitterUrl || null,
        website_url: websiteUrl || null,
      };
      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'user_id' } as any)
        .select('*')
        .maybeSingle();
      if (!error) setProfile(data as any);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div>
      <div className="mb-6 border-2 border-dashed border-foreground p-6 text-center">
        <h2 className="text-xl mb-2 tracking-tight">Welcome to the ISE Alumni Community</h2>
        <p className="text-sm">Connect. Share. Build.</p>
      </div>

      <Card className="mb-6 border-2 border-foreground shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="tracking-tight">You</CardTitle>
          <CardDescription className="mt-1"></CardDescription>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="text-sm text-muted-foreground">Loading profile…</div>
          ) : profile ? (
            (() => {
              const displayFullName = profile.full_name || (user?.user_metadata as any)?.full_name || (user?.email?.split('@')[0] ?? '—');
              const displayEmail = user?.email || profile.email || '—';
              const lastSignedIn = user?.last_sign_in_at || session?.last_sign_in_at || '—';
              const anyData = profile as any;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                    <div><span className="opacity-70">Name:</span> {displayFullName}</div>
                    <div><span className="opacity-70">Email:</span> {displayEmail}</div>
                    <div><span className="opacity-70">Last signed in:</span> {lastSignedIn}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="text-xs opacity-70">Full Name</label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Graduation Year</label>
                      <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2020" inputMode="numeric" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">City</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Country</label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Role</label>
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Company</label>
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs opacity-70">Bio</label>
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={3} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">GitHub</label>
                      <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">LinkedIn</label>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Twitter / X</label>
                      <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/username" />
                    </div>
          <div>
                      <label className="text-xs opacity-70">Website</label>
                      <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://your-site.com" />
                    </div>
          </div>
                  <div className="flex flex-col md:flex-row md:justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto border-2 border-foreground shadow-none">
                      {saving ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const displayFullName = (user?.user_metadata as any)?.full_name || (user?.email?.split('@')[0] ?? '—');
              const displayEmail = user?.email || '—';
              const lastSignedIn = user?.last_sign_in_at || session?.last_sign_in_at || '—';
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-sm">
                    <div><span className="opacity-70">Name:</span> {displayFullName}</div>
                    <div><span className="opacity-70">Email:</span> {displayEmail}</div>
                    <div><span className="opacity-70">Last signed in:</span> {lastSignedIn}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                    <div>
                      <label className="text-xs opacity-70">Full Name</label>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Graduation Year</label>
                      <Input value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="2020" inputMode="numeric" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">City</label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Country</label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Role</label>
                      <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Company</label>
                      <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs opacity-70">Bio</label>
                      <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio" rows={3} />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">GitHub</label>
                      <Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">LinkedIn</label>
                      <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://www.linkedin.com/in/username" />
                    </div>
                    <div>
                      <label className="text-xs opacity-70">Twitter / X</label>
                      <Input value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="https://twitter.com/username" />
                </div>
                <div>
                      <label className="text-xs opacity-70">Website</label>
                      <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://your-site.com" />
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:justify-end">
                    <Button onClick={handleSaveProfile} disabled={saving} className="w-full md:w-auto border-2 border-foreground shadow-none">
                      {saving ? 'Saving…' : 'Save Profile'}
                    </Button>
                  </div>
                </div>
              );
            })()
          )}
        </CardContent>
      </Card>

   

    </div>
  );
};

export default Index;
