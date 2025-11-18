import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Map = () => {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-0">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Map</h1>

      <Card className="border-none shadow-none">
        <CardContent>
          <div className="aspect-[16/9] w-full border-2 border-dashed border-foreground grid place-items-center">
            <span className="text-xs">Map placeholder</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Map;


