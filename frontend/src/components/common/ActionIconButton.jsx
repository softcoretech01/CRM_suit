import React from 'react';
import { Eye, Edit2, PauseCircle, PlayCircle, Trash2, UserPlus, ArrowRightLeft, Settings } from 'lucide-react';

/**
 * A reusable, premium modern action icon button for CRM tables.
 * Implements hover micro-interactions, semantic colors, and custom tooltips.
 * 
 * Props:
 * - type: 'view' | 'edit' | 'status' | 'delete' | 'assign' | 'convert'
 * - icon: Override default icon for type
 * - tooltip: Tooltip text
 * - isActive: boolean (only for 'status' type to toggle between Pause/Activate)
 * - onClick: click handler
 */
export default function ActionIconButton({ type, tooltip, isActive, className = '', icon: CustomIcon, ...props }) {
  let btnClass = `action-icon-btn ${className}`;
  let IconComponent = Settings;
  let defaultTooltip = tooltip;

  switch (type) {
    case 'view':
      btnClass += ' btn-view';
      IconComponent = Eye;
      defaultTooltip = tooltip || 'View';
      break;
    case 'edit':
      btnClass += ' btn-edit';
      IconComponent = Edit2;
      defaultTooltip = tooltip || 'Edit';
      break;
    case 'status':
      if (isActive) {
        btnClass += ' btn-pause';
        IconComponent = PauseCircle;
        defaultTooltip = tooltip || 'Pause';
      } else {
        btnClass += ' btn-activate';
        IconComponent = PlayCircle;
        defaultTooltip = tooltip || 'Activate';
      }
      break;
    case 'delete':
      btnClass += ' btn-delete';
      IconComponent = Trash2;
      defaultTooltip = tooltip || 'Delete';
      break;
    case 'assign':
      btnClass += ' btn-view'; // Neutral/blue styling
      IconComponent = UserPlus;
      defaultTooltip = tooltip || 'Assign';
      break;
    case 'convert':
      btnClass += ' btn-activate'; // Green styling
      IconComponent = ArrowRightLeft;
      defaultTooltip = tooltip || 'Convert';
      break;
    default:
      btnClass += ' btn-view'; // Fallback
      IconComponent = CustomIcon || Settings;
  }

  const FinalIcon = CustomIcon || IconComponent;

  return (
    <button
      type="button"
      className={btnClass}
      data-tooltip={defaultTooltip}
      aria-label={defaultTooltip}
      title="" // override native browser tooltip
      {...props}
    >
      <FinalIcon size={18} strokeWidth={2} />
    </button>
  );
}
