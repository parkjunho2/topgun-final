import { NavLink, useNavigate } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { loginState, userState } from "../../util/recoil";
import axios from "axios";
import { useCallback } from "react";

const Header = () => {

    const navigate = useNavigate();

    const login = useRecoilValue(loginState);//읽기전용 항목은 이렇게 읽음

    //recoil state
    const [user, setUser] = useRecoilState(userState);


    //callback
    const logout = useCallback((e) => {
        //e.preventDefault();

        //recoil에 저장된 memberId와 memberLevel을 제거
        setUser({
            userId: '',
            userType: '',
        });

        //axios에 설정된 Authorization 헤더도 제거
        delete axios.defaults.headers.common["Authorization"];

        //localStorage, sessionStorage의 refreshToken을 제거
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.removeItem("refreshToken");

        navigate("/");
    }, [navigate, setUser]);

    return (
        <>
            {/* 헤더 */}
            <header className="p-3 bg-dark text-white">
                <div className="container">
                    <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
                        {/* 브랜딩 텍스트 추가 - 내가볼땐 이미지가 더나을거같음.. */}
                        <span className="d-flex align-items-center mb-lg-0 text-white text-decoration-none fs-4">
                            TopGun
                        </span>
                        <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
                            <li>
                                <NavLink to="/" className="nav-link px-2 text-white">
                                    홈
                                </NavLink>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    Pricing
                                </a>
                            </li>
                            <li>
                                <NavLink to="/room" className="nav-link px-2 text-white">
                                    Chat
                                </NavLink>
                            </li>
                            <li>
                                <a href="#" className="nav-link px-2 text-white">
                                    About
                                </a>
                            </li>
                            <li>
                                <a href="/flight" className="nav-link px-2 text-white">
                                    flight
                                </a>
                            </li>
                            <li>
                                <a href="/notice" className="nav-link px-2 text-white">
                                    notice
                                </a>
                            </li>
                        </ul>
                        <div className="text-end">
                            {/* 로그인이 되어있다면 아이디(등급) 형태로 출력 */}
                            {login ? (<>
                                <button type="button" onClick={e => navigate("/mypage")} className="btn text-light text-decoration-none me-2">
                                    {user.userId}
                                    ({user.userType})
                                </button>
                                <button type="button" onClick={logout} className="btn btn-danger me-2">
                                    로그아웃
                                </button>
                            </>) : (<>
                                {/* 여기 로그인되면 수정해야할것 */}
                                <button type="button" onClick={e => navigate("/login")} className="btn btn-success me-2">
                                    로그인
                                </button>
                            </>)}
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};
export default Header;