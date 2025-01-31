import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

import { poolData } from "./poolData.js";

async function test5(query) {
    const browser = await puppeteer.launch({ headless: true }); // 비헤드리스 모드 실행
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36');

  // 1. 지도 어플리케이션으로 이동 - allSearch 경로로 요청하기 위해, 페이지 내에 연결 컨텍스트 유지하기.
  await page.goto('https://map.naver.com/p', {
    waitUntil: 'networkidle2', // 네트워크 요청이 대부분 완료될 때까지 대기
  });

  const preUrl = `/p/api/search/allSearch?query=${encodeURIComponent(query)}&type=all&searchCoord=127.03396200000066%3B37.20950000000062&boundary=`

  // evaluate 는 현재 열린 페이지 내에서, 콜백 함수로 주어진 인자를 실행하겠다는 것이다.
  // 그런데, evaluate 에 함수의 인자가 들어가지 못하여, 밑에 따로 "preUrl" 을 인자로 주어 사용할 수 있게 만들었다.
  const allSearchResponse = await page.evaluate(async (url) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json(); // JSON 데이터 반환
  }, preUrl);

  console.log('AllSearch Response:', allSearchResponse);

  await page.close();
  // 이건 꼭 닫아줘야 함.
  await browser.close();

  return allSearchResponse;
}


async function putPoolImageInfos(pool_id, image_urls){
  const response = await axios.put(`http://localhost:3000/api/v1/pools/images/${pool_id}`, {
    imageUrls : image_urls
  })

  return response;
}

// 추후 "주소 + 이름" 배열을 받아 실행된다.
async function sequalTest() {
  const poolDatas = poolData;

  // const testKeyword = ["동탄문화센터 수영장", "경기도 화성시 경기대로 1054 위니펫동물병원"];

  for(let poolData of poolDatas) {
    const pool_id = poolData.id;
    const addressTokens = poolData.address.split(" ");

    let address = "";
    for(let i = 0; i < 3; i++) {
      address += addressTokens[i] + " ";
    }

    const name = poolData.name;

    const keyword = `${address} ${name}`;

    const {result} = await test5(keyword);

    // 만약 조회 결과가 없다면
    if(!(result.place && result.place.list)) {
      continue;
    }

    // 네이버 지역 결과 추출 
    const isExistPlace = result.place.list;
    let image_urls = [];

    // 만약 장소가 존재한다면 
    if(isExistPlace) {
      image_urls = result.place.list[0].thumUrls
    } 

    // 그리고 장소의 이미지가 존재한다면,
    if(image_urls.length !== 0) {
      try{
        const response = await putPoolImageInfos(pool_id, image_urls);
        console.log(response);
      } catch(err) {
        console.log(err);
        console.log(pool_id + " is Failed");
      }
    }
  }

}



sequalTest();