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
    <div className="sticky top-4 right-4 transform bg-white/95 shadow-lg rounded-lg p-4 border border-gray-200 mb-4">
      <ul className="flex items-start justify-between relative">
        {steps.map((step, index) => (
          <li
            key={index}
            className="flex flex-col items-center relative w-24"
            onClick={() => onStepClick(index)}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-medium mb-2 cursor-pointer ${
                  step.isCurrent
                    ? "bg-teal-600 text-white"
                    : step.isComplete
                    ? "bg-teal-600 text-white"
                    : "bg-gray-300 text-white"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs text-center ${
                  step.isCurrent
                    ? "text-teal-600 font-bold"
                    : step.isComplete
                    ? "text-gray-600"
                    : "text-gray-400"
                }`}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressIndicator;
