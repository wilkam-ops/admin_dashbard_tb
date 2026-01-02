import React from 'react';

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass = 'bg-primary' }) => {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground mb-2">{value}</p>
          {trend && (
            <p className={`text-sm ${
              trend === 'up' ? 'text-secondary' : 'text-destructive'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </p>
          )}
        </div>
        <div className={`${colorClass} rounded-lg p-3`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export const PageHeader = ({ title, description, action }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
