type SpinLoaderProps = {
    className?: string;
}


export function SpinLoader({className = ''}: SpinLoaderProps){
    const baseClasses = "flex items-center justify-center"
    const combinedClasses = `${baseClasses}  ${className}`;
    return <div className={combinedClasses}>
        <div className="w-10 h-10 border-5 border-t-transparent border-primary-700 rounded-full animate-spin"></div>
    </div>
}


