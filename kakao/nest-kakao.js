import axios from "axios";

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

export async function kakaoWithNest(excelRecords) {
    const dataWithKaKao = [];

    for(let excelRecord of excelRecords) {
        try{

            const response = await axios.post("http://localhost:3000/api/v1/pools", {
                name : excelRecord.name,
                address : excelRecord.address_new ? excelRecord.address_new : excelRecord.address_old,
                phone : excelRecord.phone_number,
            })

            console.log(response.data);
        } catch (err) {
            console.log(err);
        }
    }
}