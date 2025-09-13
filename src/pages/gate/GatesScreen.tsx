import React from 'react';
import { useGates } from '../../services/api';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MdRouter } from 'react-icons/md';

const GatesScreen = () => {
  const { data: gates, isLoading, isError } = useGates();

  if (isLoading) {
    return (
      <div className="p-6 text-center text-lg font-medium">
        Loading gates...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-lg font-medium text-destructive">
        Error loading gates. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Select a Gate
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gates?.map((gate) => {
          // Add a check to ensure 'gate' is not null or undefined
          if (!gate) {
            return null; 
          }
          return (
            <Link key={gate.id} to={`/gate/${gate.id}`} className="block">
              <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{gate.name}</CardTitle>
                  <MdRouter className="h-6 w-6 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gate ID: {gate.id}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Serving {gate.zones?.length || 0} parking zones
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GatesScreen;