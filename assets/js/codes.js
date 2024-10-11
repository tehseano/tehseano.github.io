const CodeGroup = ({ codes, groupIndex }) => {
    const copyToClipboard = () => {
        const textToCopy = codes.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Codes copied to clipboard!');
        });
    };

    return (
        <div className="mb-4 p-4 border border-gray-300 rounded">
            <h2 className="text-xl font-bold mb-2">Group {groupIndex + 1}</h2>
            <div className="max-h-40 overflow-y-auto mb-2">
                <p className="whitespace-pre-wrap">
                    {codes.join(', ')}
                </p>
            </div>
            <button 
                onClick={copyToClipboard}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Copy All Codes in Group
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
            <h1 className="text-2xl font-bold mb-4">Grouped Code List</h1>
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