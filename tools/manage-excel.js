import XLSX from "xlsx";

export async function getExcelData () {
    const workbook = XLSX.readFile('excel_file/excel-data.xlsx');

    const sheet = workbook.Sheets["data1"];

    const table = XLSX.utils.sheet_to_json(sheet);

    const obj = {};

    let newTable = [];

    newTable = await Promise.all(
        table.map(async record => {

            return {
                manage_number : record["manage_number"],
                phone_number : record["phone_number"],
                address_old : record["address_old"],
                address_new : record["address_new"],
                name : record["name"],
            }
        })
    )
    /*
    [
        {
            manage_number : string,
            phone_number : string,
            address_old : string,
            address_new : string,
            name : string,
        },
        ....
        1000 개의 객체 배열 
    ]
    */
    console.log("엑셀 데이터 추출 성공");

    return newTable;
}

export async function writeExcelData(processedData) {
    console.log(processedData);
    try{
        const formattedData = processedData.map((item) => {
            const baseData = {
                "Place ID": item.place_id,
                "Name": item.name,
                "Address": item.formatted_address,
                "Latitude": item.lat,
                "Longitude": item.lng,
            };

            // photos 배열을 Image 1, Image 2 ...로 분리
            if (item.photos && item.photos.length > 0) {
                item.photos.forEach((photo, index) => {
                    baseData[`Image ${index + 1}`] = photo;
                });
            }

            return baseData;
        });

    
        const newBook = XLSX.utils.book_new();
        const newSheet = XLSX.utils.json_to_sheet(formattedData);
    
        XLSX.utils.book_append_sheet(newBook, newSheet, "ProcessedData");
    
        XLSX.writeFileXLSX(newBook, "./ProcessedData.xlsx");
    
        console.log("엑셀 파일 저장 완료");
    } catch(err){
        console.log("processedData");
        console.log(err);
    }
}

getExcelData();