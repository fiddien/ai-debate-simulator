type step = {
  name: string;
  isComplete: boolean;
  isCurrent: boolean;
};

interface ProgressIndicatorProps {
  steps: step[];
  onStepClick: (index: number) => void;
}

const ProgressIndicator = ({ steps, onStepClick }: ProgressIndicatorProps) => {
  return (
    <div className="progress-indicator">
      <ul className="progress-indicator-list">
        {steps.map((step, index) => (
          <li
            key={index}
            className="progress-indicator-item"
            onClick={() => onStepClick(index)}
          >
              <span
                className={`progress-indicator-text ${
                  step.isCurrent
                    ? "progress-indicator-text-current"
                    : step.isComplete
                    ? "progress-indicator-text-complete"
                    : "progress-indicator-text-incomplete"
                }`}
              >
                {step.name}
              </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressIndicator;
