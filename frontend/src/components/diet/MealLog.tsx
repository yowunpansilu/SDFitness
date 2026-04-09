import { AppSkeleton } from '../ui/AppSkeleton';
import { Plus } from 'lucide-react';

interface MealLogProps {
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';
  calories: number;
  items: string[];
  isLoading?: boolean;
}

export function MealLog({ type, calories, items, isLoading = false }: MealLogProps) {
  return (
    <AppSkeleton name={`meal-log-${type.toLowerCase()}`} loading={isLoading}>
      <div className="meal-log">
        <div className="meal-log__header">
          <div>
            <h3 className="meal-log__title">{type}</h3>
            <p className="meal-log__meta">{calories} kcal</p>
          </div>
          <button className="meal-log__add" aria-label={`Add to ${type}`}>
            <Plus size={20} />
          </button>
        </div>
        
        {items.length > 0 ? (
          <ul className="meal-log__items">
            {items.map((item, i) => (
              <li key={i} className="meal-log__item">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light mr-2 inline-block" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <div className="meal-log__empty">
            No items logged yet.
          </div>
        )}
      </div>
    </AppSkeleton>
  );
}
