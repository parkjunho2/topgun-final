import Footer from './components/Footer/Footer';
import Header from './components/Header/Header';
import MainPage from './components/MainPage/MainPage';
import Login from './components/Login/Login';
import NotFound from './components/NotFound/NotFound';
import './components/Global.css';
import Test from './components/Test';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import 'react-datepicker/dist/react-datepicker.css'; // 스타일 가져오기
import { Route, Routes, useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginState, memberLoadingState, userState } from './util/recoil';
import { useCallback, useEffect } from 'react';
import axios from 'axios';
import PrivateRoute from './components/Route/PrivateRoute';
import Flight from './components/Flight';
import AdminRoute from './components/Route/AdminRoute';
import Admin from './components/Admin';
import NotMemberRoute from './components/Route/NotMemberRoute';
import AirLine from './components/AirLine.js';
import Chat from './components/chat/Chat';
import Notice from './components/notice.js'; // Notice 컴포넌트 임포트




const App = () => {

  //recoil state
  const [, setUser] = useRecoilState(userState);
  const [memberLoading, setMemberLoading] = useRecoilState(memberLoadingState);



  //최초 1회 실행
  useEffect(() => {
    refreshLogin();
  }, []);

  //callback
  const refreshLogin = useCallback(async () => {
    //[1] sessionStorage에 refreshToken이라는 이름의 값이 있는지 확인
    const sessionToken = window.sessionStorage.getItem("refreshToken");
    //[2] localStorage에 refreshToken이라는 이름의 값이 있는지 확인
    const localToken = window.localStorage.getItem("refreshToken");
    //[3] 둘다 없으면 차단
    if (sessionToken === null && localToken === null) {
      setMemberLoading(true);
      return;
    }
    //[4] 둘 중 하나라도 있다면 로그인 갱신을 진행
    const refreshToken = sessionToken || localToken;

    //[5] 헤더에 Authorization 설정
    axios.defaults.headers.common["Authorization"] = "Bearer " + refreshToken;

    //[6] 백엔드에 갱신 요청을 전송
    const resp = await axios.post("http://localhost:8080/users/refresh");

    //[7] 갱신 성공 시 응답(resp)에 담긴 데이터들을 적절하게 분배하여 저장(로그인과 동일)
    setUser({
      userId: resp.data.usersId,
      userType: resp.data.usersType,
    });

    axios.defaults.headers.common["Authorization"] = "Bearer " + resp.data.accessToken;
    if (window.localStorage.getItem("refreshToken") !== null) {
      window.localStorage.setItem("refreshToken", resp.data.refreshToken);
    }
    else {
      window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
    }

    setMemberLoading(true);
  }, []);


  const location = useLocation();

  // 헤더를 숨길 경로 배열
  const noHeaderRoutes = ['/login', '/join'];

  return (
    <>
      {!noHeaderRoutes.includes(location.pathname) && <Header />}
      <Routes>
        <Route exact path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} /> {/* 로그인 */}


        {/* 로그인 되어야지만 볼 수 있는 페이지 */}
        <Route element={<PrivateRoute />}>
          <Route path="/test" element={<Test />} />
          <Route path="/chat" element={<Chat />} />
        </Route>


        {/* 관리자만 봐야하는 페이지 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* 멤버만 못보는 페이지 -> ADMIN, AIRLINE만 가능 */}
        <Route element={<NotMemberRoute />}>
          <Route path="/airline" element={<AirLine />} />
        </Route>

        {/* 공지사항 페이지 추가 */}
        <Route path="/notice" element={<Notice />} />  {/* Notice 페이지 경로 설정 */}

        <Route path="/flight" element={<Flight />} />
        <Route path="*" element={<NotFound />} /> {/* 모든 잘못된 경로 처리 */}

      </Routes>
      <Footer />

    </>
  );
}

export default App;