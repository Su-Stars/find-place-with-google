/*
저장하게 될 변수 목록
1. place_id => 지도에서 하나의 장소에 대한 고유 번호 즉, 이걸로 유니크를 생성할 겁니다.
2. name => 해당 수영장을 운영하고 있는 사설, 공공시설의 이름
3. formatted_address => 많은 수영장들이 도로명이 아닌, 지번을 사용하고 있으므로, 구글에서 제공하는 정확한 도로명으로 대체 할 겁니다.
4. lat => 어짜피 구글 API 로 지도 연동하면 "place_id" 로 가져올 수 있는데, 쓸모 있을지도 몰라서 저장.
5. lng => 위의 이유와 같음.
6. photos => 사진이 여러장일 가능성이 더 높으므로, 이 컬럼을 기준으로 오른쪽 방향으로 지속적으로 데이터 적층 (URL)
*/

export class PollInfo {
    constructor() {
        this.place_id = ""; // 구글 Map API 에서 제공하는 고유 아이디임
        this.name = ""; // 상호명
        this.formatted_address = ""; // 도로명
        this.lat = 0;
        this.lng = 0;
        this.photos = []; // 사진이 없을수도 있음.
    }
    

    async getDataArray(){
        const returnArr = [];
        returnArr.push(this.place_id);
        returnArr.push(this.name);
        returnArr.push(this.formatted_address);
        returnsArr.push(this.lat);
        returnArr.push(this.lng);

        // 이미지 정보는 정해진 규격 없이 오른쪽으로 뻗어나갈 수 있게 만듬.
        this.photos.forEach((photo) => {
            returnArr.push(photo);
        })
    }

    async setDataAttr(place_info) {
        console.log("place_id : ", place_info.place_id);

        this.place_id = place_info.place_id;
        this.name = place_info.name;
        this.formatted_address = place_info.formatted_address;
        this.lat = place_info.lat;
        this.lng = place_info.lng;
        this.photos = place_info.photos || [];
    }

    isEmpty(){
        return this.place_id === "" ? true : false;
    }

    setPlaceId(place_id) {
        this.place_id = place_id;
    }
    getPlaceId(){
        return this.place_id;
    }

    setName(name){
        this.name = name;
    }
    getName(){
        return this.name;
    }

    setFormattedAddress(formatted_address) {
        this.formatted_address = formatted_address;
    }
    getFormattedAddress() {
        return this.formatted_address;
    }

    setLat(lat) {
        this.lat = lat;
    }
    getLat(){
        return this.lat;
    }

    setLng(lng) {
        this.lng = lng;
    }
    getLng(){
        return this.lng;
    }

    setPhotos(photos){
        this.photos = photos;
    }
    getPhotos(){
        return this.photos;
    }
}