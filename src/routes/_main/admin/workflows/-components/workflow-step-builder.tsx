import * as React from 'react';
import * as Select from '@/components/ui/select';
import * as FancyButton from '@/components/ui/fancy-button';
import { RiAddLine, RiDeleteBinLine, RiDraggable } from '@remixicon/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export interface WorkflowStepData {
  id?: string;
  stepOrder: number;
  assigneeRole: string;
  action: string;
}

interface WorkflowStepBuilderProps {
  steps: WorkflowStepData[];
  onChange: (steps: WorkflowStepData[]) => void;
  // This would typically come from an API mapping roles for the org
  // For now we'll hardcode some sensible defaults from the schema
  availableRoles?: { id: string; name: string }[]; 
}

const ACTION_OPTIONS = [
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'REVIEW', label: 'Review' },
];

export function WorkflowStepBuilder({ steps, onChange, availableRoles = [] }: WorkflowStepBuilderProps) {
  // If we don't have real roles passed down yet, fallback to some mock ones for the UI to work
  const roles = availableRoles.length > 0 
    ? availableRoles 
    : [
        { id: 'Manager', name: 'Manager' },
        { id: 'Finance', name: 'Finance' },
        { id: 'Admin', name: 'Admin' },
      ];

  const addStep = () => {
    onChange([
      ...steps,
      { stepOrder: steps.length + 1, assigneeRole: roles[0].id, action: 'APPROVE' }
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Recompute stepOrder
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    onChange(newSteps);
  };

  const updateStep = (index: number, updates: Partial<WorkflowStepData>) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onChange(newSteps);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;

    const newSteps = Array.from(steps);
    const [reorderedItem] = newSteps.splice(sourceIndex, 1);
    newSteps.splice(destinationIndex, 0, reorderedItem);

    // Recompute stepOrder
    newSteps.forEach((step, i) => {
      step.stepOrder = i + 1;
    });
    
    onChange(newSteps);
  };

  return (
    <div className="flex flex-col gap-3">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="workflow-steps">
          {(provided) => (
            <div 
              {...provided.droppableProps} 
              ref={provided.innerRef}
              className="flex flex-col gap-3"
            >
              {steps.map((step, idx) => (
                <Draggable key={step.id || `step-${idx}`} draggableId={step.id || `step-${idx}`} index={idx}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={provided.draggableProps.style as React.CSSProperties}
                      className={`flex items-center gap-3 bg-bg-weak-50 p-3 rounded-xl border ${snapshot.isDragging ? 'border-stroke-strong-950 shadow-md ring-2 ring-primary-soft-200' : 'border-stroke-soft-200'}`}
                    >
                      <div className="flex flex-col gap-1 pr-2 border-r border-stroke-soft-200 cursor-grab active:cursor-grabbing items-center justify-center text-text-sub-600 hover:text-text-strong-950 transition-colors" {...provided.dragHandleProps}>
                        <RiDraggable className="size-5" />
                        <span className="text-label-xs">{step.stepOrder}</span>
                      </div>

                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-label-xs text-text-sub-600">Assignee Role</span>
                        <Select.Root value={step.assigneeRole} onValueChange={(val) => updateStep(idx, { assigneeRole: val })}>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            {roles.map((r) => (
                              <Select.Item key={r.id} value={r.id}>
                                {r.name}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-label-xs text-text-sub-600">Action</span>
                        <Select.Root value={step.action} onValueChange={(val) => updateStep(idx, { action: val })}>
                          <Select.Trigger>
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            {ACTION_OPTIONS.map((opt) => (
                              <Select.Item key={opt.value} value={opt.value}>
                                {opt.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Root>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStep(idx)}
                        className="p-2 ml-2 text-text-sub-600 hover:text-text-error-600 transition-colors self-end"
                      >
                        <RiDeleteBinLine className="size-5" />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {steps.length === 0 && (
        <div className="py-4 text-center text-paragraph-sm text-text-sub-600 bg-bg-weak-50 rounded-xl border border-stroke-soft-200 border-dashed">
          No steps configured.
        </div>
      )}

      <div className="pt-2">
        <FancyButton.Root type="button" variant="neutral" size="small" onClick={addStep}>
          <FancyButton.Icon as={RiAddLine} />
          Add Step
        </FancyButton.Root>
      </div>
    </div>
  );
}
