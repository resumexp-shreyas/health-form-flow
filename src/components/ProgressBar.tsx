interface ProgressBarProps {
  answered: number;
  total: number;
}

const ProgressBar = ({ answered, total }: ProgressBarProps) => {
  const pct = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>
          {answered} of {total} answered
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
