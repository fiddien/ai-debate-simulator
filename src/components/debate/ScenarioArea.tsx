import { Scenario } from "@/types";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";

interface ScenarioCardProps {
  scenario: Scenario;
}

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Scenario</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Section */}
        <div className="space-y-4">
          <div className="text-xl">
            <span className="font-medium">Situation: </span>
            <span className="bg-teal-100 px-2 py-1 rounded">
              {scenario.situation}
            </span>
          </div>

          <div>
            <span className="font-medium">Action: </span>
            {scenario.action}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Actors: </span>
            <div className="flex flex-wrap gap-2">
              {scenario.actors.map((actor, i) => (
                <Badge key={i} variant="outline">
                  {actor}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Rule-of-Thumb Section */}
        <div className="space-y-4">
          <div className="text-xl">
            <span className="font-medium">Rule-of-Thumb: </span>
            <span className="bg-teal-100 px-2 py-1 rounded">{scenario.rot}</span>
          </div>

          <div className="space-y-3">

          <div className="flex items-center gap-2">
              <span className="font-medium">Categories:</span>
              {scenario.rotCategorization?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {scenario.rotCategorization.map((category, i) => (
                    <Badge key={i} variant="outline" className="bg-purple-50">
                      {category}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">None specified</span>
              )}
            </div>

            <div className="flex gap-2">
              <span className="font-medium">Moral Foundations:</span>
              {(scenario.rotMoralFoundations?.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {scenario.rotMoralFoundations.map((foundation, i) => (
                    <Badge key={i} variant="outline" className="bg-purple-50">
                      {foundation}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">None specified</span>
              )}
            </div>

            <div className="flex gap-6">
              <div>
                <span className="font-medium">Quality Issues? </span>
                <Badge variant="outline" className={`${
                  scenario.rotBad ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {scenario.rotBad ? 'Yes' : 'Clear'}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Public Agreement: </span>
                {scenario.rotAgree !== null && scenario.rotAgree !== undefined ? (
                  <Badge variant="outline" className={`${
                    scenario.rotAgree === 0 ? 'bg-red-100 text-red-700' :
                    scenario.rotAgree === 1 ? 'bg-orange-100 text-orange-700' :
                    scenario.rotAgree === 2 ? 'bg-yellow-100 text-yellow-700' :
                    scenario.rotAgree === 3 ? 'bg-lime-100 text-lime-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {scenario.rotAgree === 0 ? '< 1%' :
                      scenario.rotAgree === 1 ? '5-25%' :
                      scenario.rotAgree === 2 ? '~50%' :
                      scenario.rotAgree === 3 ? '75-90%' :
                      '> 99%'
                    }
                  </Badge>
                ) : (
                  <span className="text-gray-500 italic">Not rated</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
