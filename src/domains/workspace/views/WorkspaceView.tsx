import { WorkspaceCard, WORKSPACE_SECTIONS } from '../components/WorkspaceCard';
import { CompletionBanner } from '../components/CompletionBanner';
import { useWorkspaceConfig, useWorkspaceCompletion, computeCompletionPercent } from '../hooks/useWorkspaceConfig';

export const WorkspaceView = () => {
  const { data: config } = useWorkspaceConfig();
  const completionItems = useWorkspaceCompletion(config);
  const percent = computeCompletionPercent(completionItems);

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-[#3D2C2C] mb-1">Workspace</h1>
        <p className="text-sm font-light text-[#7A6B67]">
          Todo lo que necesitas para mantener tu negocio vivo.
        </p>
      </div>

      {/* Completion Banner */}
      {percent < 100 && (
        <CompletionBanner
          percent={percent}
          pendingItems={completionItems}
        />
      )}

      {/* Grid de secciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WORKSPACE_SECTIONS.map((section, index) => (
          <WorkspaceCard key={section.id} section={section} index={index} />
        ))}
      </div>
    </div>
  );
};
