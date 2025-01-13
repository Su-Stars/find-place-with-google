import XLSX from "xlsx";

export const getExcelData = async () => {
    const workbook = XLSX.readFile('excel_file/excel-data.xlsx');

    const sheet = workbook.Sheets["data1"];

    const table = XLSX.utils.sheet_to_json(sheet);

    const newTable = [];
    for(let i = 0; i < table.length; i++) {
        const obj = {};
        
        const record = table[i];

        obj["manage_number"] = record["manage_number"];
        obj["address_old"] = record["address_old"];
        obj["address_new"] = record["address_new"];
        obj["name"] = record["name"];

        newTable.push(obj);
    }

    return newTable;
}

const writeExcelData = async () => {

}

getExcelData()