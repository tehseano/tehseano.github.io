const CodeList = ({ codes }) => {
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Copyable Code List</h1>
            <ul>
                {codes.map((code, index) => (
                    <li key={index} className="mb-2">
                        <span className="mr-2">{code}</span>
                        <button 
                            onClick={() => copyToClipboard(code)}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                        >
                            Copy
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const App = () => {
    const [codes, setCodes] = React.useState([]);

    React.useEffect(() => {
        // Fetch codes from the JSON file in the same repository
        fetch('codes.json')
            .then(response => response.json())
            .then(data => setCodes(data.codes));
    }, []);

    return <CodeList codes={codes} />;
};

ReactDOM.render(<App />, document.getElementById('root'));