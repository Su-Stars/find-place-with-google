import axios from "axios";
import { API_KEY } from "./constants.js";
import { PollInfo } from "./type/poll.js";

/*
입력 레코드 예시 : 
[
    {
        "manage_number" : string, --> 공공기관에서 정해준 일부 수영장 id
        "address_old" : string, --> 지번
        "address_new" : string, --> 도로명
        "name" : string --> 상호명
    },
    {
        ...
    }
]

예상 시간 : 1100 개 정도의 데이터를 각각 호출해야 하기 때문에, 시간이 조금 걸릴 것이다.

Excel 데이터로 치환하기 위해 AoA (Array -> Array) 방식을 채택하는데,
이는 배열로 만들어야만 한다.

따라서, 
*/
export async function getDataWithApi(excelRecords) {
    // 주어진 모든 엑셀 데이터 배열에 대해서 수행한다.
    let apiResultRecord = [];
    for(let i = 0; i < excelRecords.length; i++) {
        const record = excelRecords[i];

        console.log("i = ", i);

        /*
        지번 주소만 있을 경우, 지번 주소로 검색 실행. or 도로명 검색 실행

        맨 앞의 분리된 주소로 시작하여 하나씩 대입하여 "하나의 장소만 나올 때 까지"
        데이터를 요청.
        */
        const addrArrToken = (record.address_new) ? record.address_new.split(" ") : record.address_old.split(" ");

        // 처음부터는 "경기도 화성시" 와 같이 시작.
        let index = 2;

        const name = record.name;

        let address = joinAddr(addrArrToken, index);

        // 결과가 없거나, 특정 1 개가 나올 때 까지 반복하겠다.
        while(true) {
            const apiResult = await searchPlaceWithApi(address, name) || [];

            // 검색 결과가 애초에 없거나
            // 모든 주소를 입력했음에도 결과가 없는 경우 탈출
            if(apiResult.length == 0 && index == addrArrToken.length)
                break;
            else if(apiResult.length >= 2) { // 결과가 1개가 나올 때 까지 반복.
                index++;
                address = joinAddr(addrArrToken, index)
            } else { // 1 개만 남았을 경우.
                const result = apiResult[0];

                console.log(result);

                const obj = new PollInfo();
                obj.setPlaceId(result.place_id);
                obj.setName(result.name);
                obj.setFormattedAddress(result.formatted_address);
                obj.setLat(result.lat);
                obj.setLng(result.lng);
                obj.setPhotos(result.photos);

                console.log(apiResult[0]);
                apiResultRecord.push(obj);

                break;
            }
        }
    }

    // 모든 데이터를 api 요청하고 난 뒤.
}

// 한번에 검색 결과가 나오지 않거나, 검색 결과가 없다면 이 메서드는 실행되지 않는다.
// 검색 결과를 좁히기 위해 만든 간단 메서드.
async function joinAddr(addrTokens, index) {
    let address = "";

    for(let i = 0; i < index; i++) {
        address += addrTokens[i] + " ";
    }

    return address;
}

/*
입력 인자 : 주소, 상호명

반환값 
    1. 배열 안에 담긴 하나의 place 객체
    2. 빈 배열 -> 두 개의 같은 수영장은 있을 수가 없습니다.
    3. 여러 place 객체가 담긴 배열 --> 이 경우 "하나의 place" 객체만 남을 때 까지, 주소를 덧붙여서 다시 요청합니다.

반환 예시 : 

{
  business_status: 'OPERATIONAL',
  formatted_address: '대한민국 서울특별시 중구 을지로5길 26',
  geometry: {
    location: { lat: 37.5673583, lng: 126.9851356 },
    viewport: { northeast: [Object], southwest: [Object] }
  },
  icon: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png',
  icon_background_color: '#7B9EB0',
  icon_mask_base_uri: 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet',
  name: '센터원웰니스',
  opening_hours: { open_now: false },
  photos: [
    {
      height: 3024,
      html_attributions: [Array],
      photo_reference: 'AWYs27ypHUYEOSgunVH7B57n3XG3UTHMZRmgpxQWcCXhz3OkU7f3iglnP11BoRv0VeSgZBobRIqhS90a56hH2RxBly8zMHvz_SLkS4dRd2FaEnC145_ltOP22f08qZmytdSReAGBjd2LJlHNGJlkoaYm9innNrDDfaDdhAjjNGNjUq_GLl4A',
      width: 4032
    }
  ],
  place_id: 'ChIJRSD7QO-ifDURe_O-z958ZXE',
  plus_code: { compound_code: 'HX8P+W3 서울특별시', global_code: '8Q98HX8P+W3' },
  rating: 4.3,
  reference: 'ChIJRSD7QO-ifDURe_O-z958ZXE',
  types: [ 'gym', 'health', 'point_of_interest', 'establishment' ],
  user_ratings_total: 107
}

저장하게 될 변수 목록
1. place_id => 지도에서 하나의 장소에 대한 고유 번호 즉, 이걸로 유니크를 생성할 겁니다.
2. name => 해당 수영장을 운영하고 있는 사설, 공공시설의 이름
3. formatted_address => 많은 수영장들이 도로명이 아닌, 지번을 사용하고 있으므로, 구글에서 제공하는 정확한 도로명으로 대체 할 겁니다.
4. lat => 어짜피 구글 API 로 지도 연동하면 "place_id" 로 가져올 수 있는데, 쓸모 있을지도 몰라서 저장.
5. lng => 위의 이유와 같음.
6. photos => 사진이 여러장일 가능성이 더 높으므로, 이 컬럼을 기준으로 오른쪽 방향으로 지속적으로 데이터 적층 (URL)
*/
export async function searchPlaceWithApi(address, companyName) {
    const KEY = API_KEY;

    const resultObj = {};

    try {
        // 공식문서는 Header 로 넣으라 하는데, 실제로는 파라미터로 넣어야 한다.
        const response = await getResponse(address, companyName, KEY);

        const places = response.data.results || [];
        if(places.length === 0) {
            console.log("No results found.");
            return []; // undefined 로 하면 에러난거 같아 보여서 빈 배열로 대체 
        } else if(places.length > 1) {
            console.log("두 개 이상의 장소가 검출됨.");
            return places;
        }
        
        // 방금 가져온 place
        const place = places[0];

        // place 객체에서 필요한 정보를 꺼내기
        resultObj["place_id"] = place.place_id;
        resultObj["name"] = place.name;
        resultObj["formatted_address"] = place.formatted_address;
        resultObj["lat"] = place.geometry.location.lat
        resultObj["lng"] = place.geometry.location.lng

        // 사진 있으면 배열로 추가. 물론 없으면 빈 배열로 추가됨.
        if(place.photos && place.photos.length > 0) {
            const photoArr = [];

            for(let i = 0; i < photos.length; i++) {
                const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&photoreference=${place.photos[0].photo_reference}&key=${KEY}`;
                photoArr.push(photoUrl);
            }

            resultObj["photos"] = photoArr;
        }
        console.log(resultObj);

    } catch (err) {
        console.error("Error Occurred", err.message);
    }

    // [ resultObj ] 이러한 형식으로 반환.
    const resultArr = [].push(resultObj);

    return resultArr;
}

async function getResponse(address, companyName, KEY) {
    return await axios.get("https://maps.googleapis.com/maps/api/place/textsearch/json", {
        params: {
            query: address + " " + companyName,
            key: KEY,
            fields: "place_id,name,formatted_address,photos,opening_hours", // 필요한 필드 추가
            language : "ko" // 이 설정 해야 영어로 나오지 않는다.
        },
    });
}


const testing = async () => {
    await searchPlaceWithApi("서울시 중구", "웰리스");
}

// testing();