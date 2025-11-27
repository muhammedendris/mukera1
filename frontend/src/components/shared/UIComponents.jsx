import React from 'react';

// Button Component with variants
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 outline-none';

  const variantStyles = {
    primary: `bg-blue-accent text-white hover:bg-blue-hover hover:-translate-y-0.5 hover:shadow-blue
              disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none`,
    secondary: `bg-white text-black border border-gray-200 hover:border-blue-accent hover:text-blue-accent
                disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`,
    danger: `bg-white text-error border border-error hover:bg-error hover:text-white
             disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed`,
    ghost: `bg-transparent text-gray-700 hover:bg-gray-100 hover:text-black
            disabled:text-gray-400 disabled:cursor-not-allowed`,
  };

  const sizeStyles = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
};

// Icon Button
export const IconButton = ({
  icon,
  variant = 'default',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
}) => {
  const baseStyles = 'rounded-lg transition-all duration-200 flex items-center justify-center outline-none';

  const variantStyles = {
    default: 'bg-transparent border border-gray-200 hover:bg-gray-100 hover:border-blue-accent text-gray-700',
    primary: 'bg-blue-accent text-white hover:bg-blue-hover',
    danger: 'bg-transparent border border-error text-error hover:bg-error hover:text-white',
  };

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon}
    </button>
  );
};

// Badge Component
export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap';

  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-success border border-success',
    warning: 'bg-orange-50 text-warning border border-warning',
    error: 'bg-red-50 text-error border border-error',
    info: 'bg-info text-blue-accent border border-blue-accent',
    pending: 'bg-orange-50 text-warning',
    accepted: 'bg-green-50 text-success',
    rejected: 'bg-red-50 text-error',
    reviewed: 'bg-blue-50 text-blue-accent',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Card Component
export const Card = ({ children, hoverable = false, clickable = false, onClick, className = '' }) => {
  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`
        bg-white border border-gray-200 rounded-md p-6 shadow-sm transition-all duration-200
        ${hoverable || clickable ? 'hover:-translate-y-0.5 hover:shadow-md' : ''}
        ${clickable ? 'cursor-pointer hover:border-blue-accent' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Input Component
export const Input = ({
  label,
  error,
  helper,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          className={`
            w-full h-12 px-4 border rounded-lg text-base transition-all duration-200 outline-none
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${
              error
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
            }
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-error flex items-center gap-1">
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="mt-2 text-sm text-gray-700">{helper}</p>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  error,
  helper,
  required = false,
  maxLength,
  showCount = false,
  className = '',
  ...props
}) => {
  const [count, setCount] = React.useState(props.value?.length || 0);

  React.useEffect(() => {
    setCount(props.value?.length || 0);
  }, [props.value]);

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-black mb-2">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3 border rounded-lg text-base resize-y min-h-[120px] transition-all duration-200 outline-none
          ${
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
              : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
          }
        `}
        maxLength={maxLength}
        onChange={(e) => {
          setCount(e.target.value.length);
          props.onChange?.(e);
        }}
        {...props}
      />
      <div className="flex items-center justify-between mt-2">
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : helper ? (
          <p className="text-sm text-gray-700">{helper}</p>
        ) : (
          <span></span>
        )}
        {showCount && maxLength && (
          <span
            className={`text-sm ${
              count > maxLength ? 'text-error' : 'text-gray-400'
            }`}
          >
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({ value, max = 100, size = 'md', showLabel = true, className = '' }) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-base font-medium text-black">{percentage}%</span>
          <span className="text-sm text-gray-700">
            {value} of {max}
          </span>
        </div>
      )}
      <div className={`relative overflow-hidden bg-gray-100 rounded-full ${sizeStyles[size]} w-full`}>
        <div
          className="h-full bg-gradient-to-r from-blue-accent to-blue-hover rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Loading Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        border-blue-accent border-t-transparent rounded-full animate-spin
        ${className}
      `}
    />
  );
};

// Empty State Component
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-black mb-2">{title}</h3>
      {description && <p className="text-base text-gray-700 mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
};

// Divider
export const Divider = ({ className = '', orientation = 'horizontal' }) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-gray-200 ${className}`} />;
  }
  return <div className={`h-px bg-gray-200 ${className}`} />;
};
