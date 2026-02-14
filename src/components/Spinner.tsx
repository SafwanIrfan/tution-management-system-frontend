import { Loader2 } from 'lucide-react';
import { cn } from '../utils';

interface SpinnerProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    centered?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ className, size = 'md', centered = false }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    const spinner = (
        <Loader2
            className={cn(
                "animate-spin text-indigo-600",
                sizeClasses[size],
                className
            )}
        />
    );

    if (centered) {
        return (
            <div className="flex justify-center items-center w-full min-h-[200px]">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Spinner;
