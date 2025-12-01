interface ThreeColumnProps {
  col1: string;
  col2: string;
  col3: string;
  col1Label?: string;
  col2Label?: string;
  col3Label?: string;
  col1Flex?: number;
  col2Flex?: number;
  col3Flex?: number;
  className?: string;
}

export default function TableRowThreeColumn({
  col1,
  col2,
  col3,
  col1Label = '',
  col2Label = '',
  col3Label = '',
  col1Flex = 1,
  col2Flex = 1,
  col3Flex = 1,
  className = '',
}: ThreeColumnProps) {
  const columnClass = 'relative px-4 py-3 bg-grayscale-200 text-center border-r border-grayscale-300 ';

  return (
    <div className={`flex w-full h-18 ${className} rounded-none md:rounded-4xl`}>
      {/* Coluna 1 */}
      <div className={columnClass} style={{ flex: col1Flex }}>
        {col1Label && (
          <span className="absolute top-1 left-6 text-md text-grayscale-900 pointer-events-none">
            {col1Label}:
          </span>
        )}
        <div className="pt-6 text-grayscale-900">{col1}</div>
      </div>

      {/* Coluna 2 */}
      <div className={columnClass} style={{ flex: col2Flex }}>
        {col2Label && (
          <span className="absolute top-1 left-4 text-md text-grayscale-900 pointer-events-none">
            {col2Label}:
          </span>
        )}
        <div className="pt-6 text-grayscale-900">{col2}</div>
      </div>

      {/* Coluna 3 */}
      <div className="relative px-4 py-3 bg-grayscale-200 text-center" style={{ flex: col3Flex }}>
        {col3Label && (
          <span className="absolute top-1 left-4 text-md text-grayscale-900 pointer-events-none">
            {col3Label}:
          </span>
        )}
        <div className="pt-6 text-grayscale-900">{col3}</div>
      </div>
    </div>
  );
}
