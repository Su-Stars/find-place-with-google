import {getExcelData} from "./tools/manage-excel.js";
import {getDataWithApi} from "./search-place.js";


// Local 엑셀을 기준으로 파악
async function localDataStart() {
    // 필요한 데이터만 추출하여 배열 하위 객체의 형태로 저장.
    const excelRecords = await getExcelData();

    const aoaDatas = await getDataWithApi(excelRecords);
}




localDataStart();
