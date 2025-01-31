import { getExcelData } from "../tools/manage-excel.js";
import {kakaoWithNest} from "./nest-kakao.js";

export async function kakaoIndex() {
    const excelRecords = await getExcelData();

    const getKaKaoData = await kakaoWithNest(excelRecords);
}

export async function kakaoStart() {
    await kakaoIndex();
}

kakaoStart();