const CodeGroup = ({ codes, groupIndex }) => {
    const [buttonText, setButtonText] = React.useState("Copy Codes");
    
    const fallbackCopyTextToClipboard = (text) => {
        // Create a temporary textarea element
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Make it invisible but keep it in the document
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        
        document.body.appendChild(textArea);
        
        try {
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            if (!successful) {
                throw new Error('Copy command failed');
            }
            setButtonText("Copied!");
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            setButtonText("Copy Failed");
        } finally {
            document.body.removeChild(textArea);
        }
    };

    const copyToClipboard = async () => {
        const textToCopy = codes.join('\n');
        
        // First try the modern Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(textToCopy);
                setButtonText("Copied!");
            } catch (err) {
                console.error('Clipboard API failed:', err);
                // If modern API fails, try the fallback
                fallbackCopyTextToClipboard(textToCopy);
            }
        } else {
            // If Clipboard API is not available, use the fallback
            fallbackCopyTextToClipboard(textToCopy);
        }
        
        // Reset button text after 2 seconds
        setTimeout(() => {
            setButtonText("Copy Codes");
        }, 2000);
    };

    return (
        <div id="code-container" className="mb-4 p-4 border border-gray-300 rounded">
            <h2>Code Group {groupIndex + 1}</h2>
            <div id="code-list" className="max-h-40 overflow-y-auto mb-2">
                <p className="whitespace-pre-wrap">
                    {codes.join(', ')}
                </p>
            </div>
            <button 
                onClick={copyToClipboard}
                className={`font-bold py-2 px-4 rounded ${
                    buttonText === "Copied!" 
                        ? "bg-green-500 hover:bg-green-700"
                        : buttonText === "Copy Failed"
                        ? "bg-red-500 hover:bg-red-700"
                        : "bg-blue-500 hover:bg-blue-700"
                } text-white`}
            >
                {buttonText}
            </button>
        </div>
    );
};

const CodeList = ({ codes }) => {
    const groupSize = 50;
    const reversedCodes = [...codes].reverse();
    const groupedCodes = [];
    
    for (let i = 0; i < reversedCodes.length; i += groupSize) {
        groupedCodes.push(reversedCodes.slice(i, i + groupSize));
    }
    return (
        <div className="container mx-auto p-4">
            {groupedCodes.map((group, index) => (
                <CodeGroup key={index} codes={group} groupIndex={index} />
            ))}
        </div>
    );
};

const App = () => {
    const [codes, setCodes] = React.useState([]);
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        fetch('codes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch codes');
                }
                return response.json();
            })
            .then(data => setCodes(data.codes))
            .catch(error => {
                console.error('Error fetching codes:', error);
                setError('Failed to load codes. Please try again later.');
            });
    }, []);
    if (error) {
        return <div className="text-red-500">{error}</div>;
    }
    return <CodeList codes={codes} />;
};

ReactDOM.render(<App />, document.getElementById('root'));