import { useState } from "react";
import Spreadsheet from "react-spreadsheet";



const ExcelTable = ({
    columns = ['Nume', 'Pret'],
    paramData,
}: {
    columns: string[],
    paramData: any
}) => {

    // Initialize with a reasonable number of rows and columns
    const [data, setData] = useState(Array(100).fill(Array(2).fill({ value: '' })));

    return (
        <div
            style={{
                height: '500px',
                overflow: 'auto',
                border: '1px solid #ccc',
                width: '100%',
            }}
        >
            <Spreadsheet data={data}
                columnLabels={columns}
                onChange={setData} />
        </div>
    );
}


export default ExcelTable;