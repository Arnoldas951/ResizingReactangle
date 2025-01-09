import {useState, useRef, useEffect} from 'react';

function App() {
    
    const svgElement = useRef(null);
    const [rectangleMeasurements, setRectangleMeasurements] = useState(null);
    const [resizingHandle, setResizingHandle] = useState(null);
    const [validationError, setValidationError] = useState(null);

    useEffect(() => {
        fetch('https://localhost:44337/Rectangle')
            .then(response => response.json())
            .then(json => setRectangleMeasurements(json))
            .catch(error => console.error(error));
    }, []);

    const getSVGCoords = (e) => {
        const svg = svgElement.current;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        const coords = point.matrixTransform(svg.getScreenCTM().inverse());
        return {x: coords.x, y: coords.y};
    };

    const handleMouseMove = (e) => {
        resizeRectangle(e);
    };

    const handleMouseUp = () => {
        setResizingHandle(null);
        validateRectangle();
    };

    const startResizing = (handle) => {
        setResizingHandle(handle);
    };

    const resizeRectangle = (e) => {
        const {x, y} = getSVGCoords(e);

        setRectangleMeasurements((prev) => {
            if (!prev) return prev;

            switch (resizingHandle) {
                case 'top-left':
                    return {
                        ...prev,
                        x: Math.min(x, prev.x + prev.width),
                        y: Math.min(y, prev.y + prev.height),
                        width: Math.abs(prev.x + prev.width - x),
                        height: Math.abs(prev.y + prev.height - y),
                    };
                case 'top-right':
                    return {
                        ...prev,
                        y: Math.min(y, prev.y + prev.height),
                        width: Math.abs(x - prev.x),
                        height: Math.abs(prev.y + prev.height - y),
                    };
                case 'bottom-left':
                    return {
                        ...prev,
                        x: Math.min(x, prev.x + prev.width),
                        width: Math.abs(prev.x + prev.width - x),
                        height: Math.abs(y - prev.y),
                    };
                case 'bottom-right':
                    return {
                        ...prev,
                        width: Math.abs(x - prev.x),
                        height: Math.abs(y - prev.y),
                    };
                default:
                    return prev;
            }
        });
    };

    const validateRectangle = async () => {
        try {
            const response = await fetch('https://localhost:44337/Rectangle/Validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rectangleMeasurements),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setValidationError(errorData.message || 'validation failed');
            } else {
                setValidationError(null);
            }
        } catch (error) {
            setValidationError('unable to connect to server');
        }
    };

    const renderHandles = () => {
        if (!rectangleMeasurements) return null;

        const {x, y, width, height} = rectangleMeasurements;

        const handles = [
            {position: 'top-left', cx: x, cy: y},
            {position: 'top-right', cx: x + width, cy: y},
            {position: 'bottom-left', cx: x, cy: y + height},
            {position: 'bottom-right', cx: x + width, cy: y + height},
        ];

        return handles.map((handle) => (
            <circle
                key={handle.position}
                cx={handle.cx}
                cy={handle.cy}
                r="5"
                fill="red"
                onMouseDown={() => startResizing(handle.position)}
                style={{cursor: 'pointer'}}
            />
        ));
    };

    return (
        <div className="App">
            {rectangleMeasurements && (
                <div style={{marginBottom: '10px'}}>
                    <strong>Perimeter:</strong> {2 * rectangleMeasurements.width.toFixed(2) + 2 * rectangleMeasurements.height.toFixed(2)}
                    <br/>
                    <strong>Coordinates:</strong> Height: {rectangleMeasurements.height.toFixed(2)} WIdth: {rectangleMeasurements.width.toFixed(2)}
                </div>
            )}

            {validationError && (
                <div style={{color: 'red', marginBottom: '10px'}}>
                    <strong>Error:</strong> {validationError}
                </div>
            )}
            <svg
                width="900"
                height="900"
                style={{border: '1px solid black'}}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                ref={svgElement}
            >
                {rectangleMeasurements && <rect {...rectangleMeasurements} />}
                {renderHandles()}
            </svg>
        </div>
    );
}

export default App;