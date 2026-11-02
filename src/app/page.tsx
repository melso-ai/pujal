import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Pujal</CardTitle>
          <CardDescription>Construccions Pujal</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Estudis</Badge>
            <Badge variant="secondary">Pressupostos</Badge>
            <Badge variant="outline">Comptabilitat</Badge>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="obra">Obra</Label>
            <Input id="obra" placeholder="Nom de l'obra" />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Crear</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
