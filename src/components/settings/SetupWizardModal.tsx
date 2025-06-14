
import { SetupWizard } from "./SetupWizard";

export const SetupWizardModal = ({
  showWizard,
  handleWizardComplete,
  handleWizardSkip
}: {
  showWizard: boolean,
  handleWizardComplete: (s: any) => void,
  handleWizardSkip: () => void
}) => (
  <>
    {showWizard && (
      <SetupWizard
        onComplete={handleWizardComplete}
        onSkip={handleWizardSkip}
      />
    )}
  </>
);
