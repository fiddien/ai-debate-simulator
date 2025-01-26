type step = {
  name: string;
};

interface ProgressIndicatorProps {
  steps: step[];
  onStepClick: (index: number) => void;
}

const ProgressIndicator = ({ steps, onStepClick }: ProgressIndicatorProps) => {
  return (
    <div className="progress-indicator">
      <ul className="progress-indicator-list hover:cursor-pointer">
        {steps.map((step, index) => (
          <li
            key={index}
            className="progress-indicator-item"
            onClick={() => onStepClick(index)}
          >
            <span className="progress-indicator-text">
              {step.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressIndicator;
