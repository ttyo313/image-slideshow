const images = window.api.getImages();
console.log("불러온 이미지 목록:", images);

let index = 0;
const slide = document.getElementById('slide');

function showNext() {
  if (images.length === 0) {
    console.error("슬라이드 이미지 없음");
    slide.alt = "이미지가 없습니다.";
    return;
  }

  const current = images[index];
  console.log("현재 이미지:", current); // ← 여기 출력 확인

  slide.src = current;
  slide.onerror = () => {
    console.error("이미지를 불러올 수 없습니다:", current);
    slide.alt = "이미지를 불러올 수 없습니다.";
  };

  index = (index + 1) % images.length;
}

setInterval(showNext, 10000);
showNext();
