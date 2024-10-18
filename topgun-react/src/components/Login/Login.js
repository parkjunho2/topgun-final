import { useCallback, useState } from 'react';
import axios from 'axios'; // Axios import
import { FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { MdEmail, MdLock } from 'react-icons/md';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { IoCall } from "react-icons/io5";
import './Login.css'; // 스타일을 위한 CSS 파일
import { NavLink, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { memberLoadingState, userState } from '../../util/recoil';

const Login = () => {

    // 정규식: 숫자와 특수 문자가 포함된 패턴
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$]).+$/;

    //recoil state
    const [, setUser] = useRecoilState(userState);

    const navigate = useNavigate();
    // State
    // 로그인 상태 관리
    const [loginData, setLoginData] = useState({
        usersId: '',
        usersPw: '',
        rememberMe: false,
    });

    // 회원가입 모달 상태 관리
    const [userType, setUserType] = useState('MEMBER'); // 기본값은 회원

    // 가입시 사용할 상태 관리
    const [joinData, setJoinData] = useState({
        usersId: '',
        usersPassword: '',
        usersName: '',
        usersEmail: '',
        usersContact: '',
        usersType: '',
        //회원이라면
        memberEngName: '',
        memberBirth: '',
        memberGender: '',
        //항공사라면
        airlineName: '',
        airlineNo: '',
    });

    // 유효성 검사 상태 관리
    const [validation, setValidation] = useState({
        usersIdValid: false,
        usersPasswordValid: false,
        passwordMatch: false
    });

    // 아이디, 패스워드 유효성 검사 함수
    const validateForm = () => {
        // 아이디가 비어 있지 않으면 true
        const isUsersIdValid = joinData.usersId.trim() !== '';
        // 패스워드가 비어 있지 않고, 정규식 조건을 만족하면 true
        const isUsersPasswordValid = joinData.usersPassword.trim() !== '' && passwordRegex.test(joinData.usersPassword);
        // 패스워드와 재확인 패스워드가 같으면 true
        const isPasswordMatch = joinData.usersPassword === joinData.passwordRe;

        setValidation({
            usersIdValid: isUsersIdValid,
            usersPasswordValid: isUsersPasswordValid,
            passwordMatch: isPasswordMatch,
        });
    };


    // Handler
    const InputJoinChange = useCallback(e => {
        setJoinData({
            ...joinData,
            [e.target.name]: e.target.value
        });
    }, [joinData]);

    // 입력값 변경 핸들러
    const InputChange = useCallback(e => {
        const { name, value, type, checked } = e.target;
        setLoginData({
            ...loginData,
            [name]: type === 'checkbox' ? checked : value,
        });
    }, [loginData]);

    // 키다운 핸들러
    const KeyDown = (e) => {
        if (e.key === 'Enter' && loginData.usersId && loginData.usersPw) {
            Login();
        }
    };


    // Callback
    // 로그인 요청 함수
    const Login = useCallback(async () => {
        try {
            const resp = await axios.post('http://localhost:8080/users/login', loginData);

            setUser({
                userId: resp.data.usersId,
                userType: resp.data.usersType,
            });

            axios.defaults.headers.common["Authorization"]
                = "Bearer " + resp.data.accessToken;

            if (loginData.rememberMe === true) {//로그인 유지 체크 시
                window.localStorage.setItem("refreshToken", resp.data.refreshToken);
            }
            else {//로그인 유지 미 체크시
                window.sessionStorage.setItem("refreshToken", resp.data.refreshToken);
            }

            console.log('로그인 성공:', resp.data);
            navigate('/');
        } catch (error) {
            console.error('로그인 오류:', error);
        }
    }, [loginData, navigate, setUser]);


    // 비밀번호 표시 상태 관리
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // 비밀번호 재확인 상태 관리
    const [showPasswordRe, setShowPasswordRe] = useState(false);
    const togglePasswordCheckVisibility = () => {
        setShowPasswordRe((prev) => !prev);
    };

    //멀티페이징
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = 2; // 페이지 수 (페이지 인덱스는 0부터 시작)

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
    };

    const handlePrev = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 0));
    };



    // 프로그레스 바 계산 함수 추가
    const calculateProgress = () => {
        if (userType === 'MEMBER') {
            return ((currentPage + 1) / totalPages) * 100;
        } else if (userType === 'airline') {
            return 100; // 항공사 회원은 단일 페이지이므로 100%
        }
        return 0;
    };

    // 이메일 ID와 도메인을 관리할 상태 생성
    const [emailId, setEmailId] = useState('');
    const [domain, setDomain] = useState('');

    // 입력값 변경 핸들러
    const handleIdChange = (e) => {
        setEmailId(e.target.value);
    };

    const handleDomainChange = (e) => {
        setDomain(e.target.value);
    };

    // 이메일 ID와 도메인을 합쳐서 데이터를 전송하는 함수
    const sendData = useCallback(async () => {
        const fullEmail = `${emailId}@${domain}`;
        const dataToSend = {
            ...joinData,
            usersType: userType,
            usersEmail: fullEmail, // 합쳐진 이메일을 업데이트
        };
        try {
            const response = await axios.post("http://localhost:8080/users/join", dataToSend);
            console.log(response.data); // 서버로부터 받은 응답 데이터 출력
        } catch (error) {
            console.error("Error occurred while joining:", error); // 에러 처리
        }
    }, [emailId, domain, joinData, userType]); // 의존성 배열

    // JSX
    return (
        <>
            <div className="container-fluid h-custom mt-5">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-md-9 col-lg-6 col-xl-5">
                        {/* 샘플 이미지 */}
                        <img
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
                            className="img-fluid"
                            alt="Sample"
                        />
                    </div>
                    <div className="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                        <div className="d-flex flex-row align-items-center justify-content-center justify-content-lg-start">
                            <p className="lead fw-normal mb-0 me-3">Sign in with</p>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaFacebookF />
                            </button>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaTwitter />
                            </button>
                            <button type="button" className="btn btn-primary mx-1">
                                <FaLinkedinIn />
                            </button>
                        </div>
                        <div className="divider d-flex align-items-center my-4">
                            <p className="text-center fw-bold mx-3 mb-0">Or</p>
                        </div>

                        <div className="form-floating form-outline mb-3">
                            <input
                                name="usersId"
                                type="text"
                                id="formId"
                                className="form-control form-control-lg"
                                placeholder="아이디를 입력하세요" // 안쓰지만 써야함
                                value={loginData.usersId}
                                onChange={InputChange}
                                onKeyDown={KeyDown}
                                required
                            />
                            <label className="form-label" htmlFor="formId">
                                <MdEmail /> 아이디
                            </label>
                        </div>

                        <div className="form-floating form-outline mb-3">
                            <input
                                name="usersPw"
                                type='password'
                                id="formPassword"
                                className="form-control form-control-lg"
                                placeholder="비밀번호를 입력하세요" // 안쓰지만 써야함
                                value={loginData.usersPw}
                                onChange={InputChange}
                                onKeyDown={KeyDown}
                                required
                            />
                            <label className="form-label" htmlFor="formPassword">
                                <MdLock /> 비밀번호
                            </label>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="form-check mb-0">
                                <input
                                    name="rememberMe"
                                    className="form-check-input me-2"
                                    type="checkbox"
                                    id="formRemember"
                                    checked={loginData.rememberMe}
                                    onChange={InputChange}
                                />
                                <label className="form-check-label" htmlFor="formRemember">Remember me</label>
                            </div>
                            <NavLink to="#!" className="text-body">Forgot password?</NavLink>
                        </div>

                        <div className="text-center text-lg-start mt-4 pt-2 mb-0">
                            <button
                                type="button"
                                className="btn btn-primary btn-lg"
                                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                onClick={Login}
                            >
                                로그인
                            </button>
                            <p className="small fw-bold mt-2 pt-1 mb-0">
                                Don't have an account? <NavLink className="link-danger" data-bs-toggle="modal" data-bs-target="#JoinForm" onClick={(e) => {
                                    e.preventDefault(); // 기본 동작 방지
                                }}>Register</NavLink>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 모달 */}
            <div className="modal fade" id="JoinForm" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        {/* 헤더 */}
                        <div className="modal-header">
                            <h5 className="modal-title" id="staticBackdropLabel">회원 가입</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        {/* 유저 타입 선택 */}
                        <div className="d-flex justify-content-center mt-3">
                            <div className="form-check me-3">
                                <input
                                    className="form-check-input"
                                    type="radio" id="MemberForm"
                                    name="userType"
                                    value="MEMBER"
                                    checked={userType === 'MEMBER'}
                                    onChange={() => {
                                        setUserType('MEMBER');
                                        setCurrentPage(0); // 변경 사항: 유저 타입 변경 시 페이지 초기화
                                    }} />
                                <label className="form-check-label" htmlFor="MemberForm">회원</label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="AirLineForm"
                                    name="userType"
                                    value="airline"
                                    checked={userType === 'airline'}
                                    onChange={() => {
                                        setUserType('airline');
                                        // joinData의 usersType도 업데이트
                                        setJoinData((prevData) => ({
                                            ...prevData,
                                            usersType: userType, // 새로 설정된 userType을 joinData에 반영
                                        }));
                                        setCurrentPage(0); // 변경 사항: 유저 타입 변경 시 페이지 초기화
                                    }}
                                />
                                <label className="form-check-label" htmlFor="AirLineForm">항공사</label>
                            </div>
                        </div>

                        {/* 바디 전환 */}
                        <div className="modal-body">

                            {userType === 'MEMBER' ? (
                                <div className='shadow-sm p-3 bg-body rounded border'>

                                    {/* 프로그레스 바 추가 */}
                                    <div className="progress my-3"> {/* 변경 사항: 프로그레스 바 컨테이너 추가 */}
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${calculateProgress()}%` }} // 변경 사항: 프로그레스 바 너비 설정
                                            aria-valuenow={calculateProgress()}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                        </div>
                                    </div>

                                    {/* 페이지 1 */}
                                    <div className={`page ${currentPage !== 0 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>아이디</big>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">ID</span>
                                            <div className={`form-floating ${validation.usersIdValid ? 'is-valid' : 'is-invalid'} flex-grow-1`}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${validation.usersIdValid ? 'is-valid' : 'is-invalid'}`}
                                                    placeholder="Username"
                                                    name="usersId"
                                                    value={joinData.usersId}
                                                    onChange={InputJoinChange}
                                                    onBlur={validateForm} // 폼 유효성 검사
                                                />
                                                <label>아이디</label>
                                            </div>
                                            {/* 유효성 검사에 따른 피드백 */}
                                            {validation.usersIdValid ? (
                                                <div className="valid-feedback">아주 멋진 아이디네요!</div>
                                            ) : (
                                                <div className="invalid-feedback">아이디를 입력해주세요.</div>
                                            )}
                                        </div>

                                        <big>패스워드</big>
                                        <div className="input-group has-validation mb-3">
                                            <span className="input-group-text">PW</span>
                                            <div className="form-floating flex-grow-1">
                                                <input type={showPassword ? 'text' : 'password'} className={`form-control ${validation.usersPasswordValid ? 'is-valid' : 'is-invalid'}`} name='usersPassword' value={joinData.usersPassword} onChange={e => {
                                                    InputJoinChange(e);  // 입력 변경 함수 호출
                                                }} placeholder="패스워드를 입력하세요" />
                                                <label>패스워드</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                                    onClick={togglePasswordVisibility}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>
                                            {validation.usersPasswordValid ? (
                                                <div className="valid-feedback"></div>
                                            ) : (
                                                <div className="invalid-feedback">패스워드를 입력해주세요.</div>
                                            )}
                                        </div>

                                        <big>비밀번호 재확인</big>
                                        <div className="input-group has-validation mb-3">
                                            <span className="input-group-text">PW</span>
                                            <div className="form-floating is-invalid flex-grow-1">
                                                <input
                                                    type={showPasswordRe ? 'text' : 'password'}
                                                    className={`form-control ${validation.passwordMatch ? 'is-valid' : 'is-invalid'}`}
                                                    placeholder="패스워드를 입력하세요" />
                                                <label>패스워드 확인</label>
                                                <span
                                                    className="position-absolute"
                                                    style={{ right: '30px', top: '50%', transform: 'translateY(-50%)' }}
                                                    onClick={togglePasswordCheckVisibility}
                                                >
                                                    {showPasswordRe ? <FiEyeOff /> : <FiEye />}
                                                </span>
                                            </div>

                                            {validation.passwordMatch ? (
                                                <div className="valid-feedback">패스워드가 일치합니다.</div>
                                            ) : (
                                                <div className="invalid-feedback">패스워드가 일치하지 않습니다.</div>
                                            )}

                                        </div>


                                    </div>

                                    {/* 페이지 2 */}
                                    <div className={`page ${currentPage !== 1 ? 'd-none' : ''}`}> {/* 변경 사항: currentPage에 따라 클래스 적용 */}

                                        <big>이름</big>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Name</span>
                                            <div className="form-floating is-invalid">
                                                <input type="text" className="form-control is-invalid" name="usersName" value={joinData.usersName} onChange={e => InputJoinChange(e)} placeholder="Name" />
                                                <label>이름</label>
                                            </div>
                                        </div>

                                        <big>영문 이름</big>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">ENG</span>
                                            <div className="form-floating is-invalid">
                                                <input type="text" className="form-control is-invalid" name="memberEngName" value={joinData.memberEngName} onChange={e => InputJoinChange(e)} placeholder="Eng Name" />
                                                <label>영문 이름</label>
                                            </div>
                                        </div>

                                        <big>전화 번호</big>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text"><IoCall /></span>
                                            <div className="form-floating is-invalid">
                                                <input type="tel" className="form-control is-invalid" name="usersContact" value={joinData.usersContact} onChange={e => InputJoinChange(e)} placeholder="전화 번호" />
                                                <label>영문 이름</label>
                                            </div>
                                        </div>

                                        <big>생년월일</big>
                                        <div className="input-group mb-3">
                                            <span className="input-group-text">Birth</span>
                                            <div className="form-floating is-invalid">
                                                {/* 디자인 변경 찾는중 */}
                                                <input type="date" className="form-control is-invalid" name="memberBirth" onChange={e => InputJoinChange(e)}
                                                    max={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜 선택 불가
                                                />
                                                <label>생년월일</label>
                                            </div>
                                        </div>

                                        <big>성별</big>
                                        <div className='mb-3'>
                                            <div className="form-check form-check-inline">
                                                <input className="form-check-input" type="radio" name="memberGender" id="inlineRadio1" value="M" onChange={e => InputJoinChange(e)} />
                                                <label className="form-check-label" htmlFor="inlineRadio1">남자</label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input className="form-check-input" type="radio" name="memberGender" id="inlineRadio2" value="F" onChange={e => InputJoinChange(e)} />
                                                <label className="form-check-label" htmlFor="inlineRadio2">여자</label>
                                            </div>
                                        </div>

                                        <big>이메일</big>
                                        <div className="input-group mb-3" style={{ width: '80%' }}>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="이메일을 입력하세요"
                                                    value={emailId} // 상태를 value로 설정
                                                    onChange={handleIdChange} // 변경 핸들러 설정
                                                    required
                                                />
                                                <label>ID</label>
                                            </div>
                                            <span className="input-group-text">@</span>
                                            <div className="form-floating">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="도메인을 입력하세요"
                                                    value={domain} // 상태를 value로 설정
                                                    onChange={handleDomainChange} // 변경 핸들러 설정
                                                    required
                                                />
                                                <label>Domain</label>
                                            </div>
                                        </div>


                                    </div>

                                    {/* 네비게이션 버튼 (회원인 경우) */}
                                    <div className="row mt-3">
                                        <div className="col text-start">
                                            <button
                                                className='btn btn-secondary'
                                                onClick={handlePrev}
                                                disabled={currentPage === 0}
                                            >
                                                이전
                                            </button>
                                        </div>
                                        <div className="col text-end">
                                            <button
                                                className='btn btn-primary'
                                                onClick={handleNext}
                                                disabled={currentPage === totalPages - 1}
                                            >
                                                다음
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div className='shadow-sm p-3 bg-body rounded border'>

                                    {/* 프로그레스 바 추가 */}
                                    <div className="progress my-3"> {/* 변경 사항: 프로그레스 바 컨테이너 추가 */}
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{ width: `${calculateProgress()}%` }} // 변경 사항: 프로그레스 바 너비 설정
                                            aria-valuenow={calculateProgress()}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        >
                                        </div>
                                    </div>

                                    <big>항공사 이름</big>
                                    <div className="input-group mb-3">
                                        <span className="input-group-text">항공사</span>
                                        <div className="form-floating is-invalid">
                                            <input type="text" className="form-control is-invalid" placeholder="Airline Name" />
                                            <label>Airline Name</label>
                                        </div>
                                    </div>
                                    <big>이메일</big>
                                    <div className="input-group has-validation mb-3">
                                        <span className="input-group-text">@</span>
                                        <div className="form-floating is-invalid flex-grow-1">
                                            <input type="email" className="form-control is-invalid" placeholder="이메일을 입력하세요" />
                                            <label>이메일</label>
                                        </div>
                                        <div className="invalid-feedback">
                                            Please choose a username.
                                        </div>
                                    </div>
                                    <big>비밀번호</big>
                                    <div className="input-group has-validation mb-3">
                                        <span className="input-group-text">PW</span>
                                        <div className="form-floating is-invalid flex-grow-1">
                                            <input type={showPassword ? 'text' : 'password'} className="form-control is-invalid" placeholder="비밀번호를 입력하세요" required />
                                            <label>패스워드</label>
                                        </div>
                                        <div className="invalid-feedback">
                                            Please choose a username.
                                        </div>
                                    </div>
                                    <div className="form-check mb-3">
                                        <input type="checkbox" className="form-check-input" id="showPasswordCheckbox" onChange={togglePasswordVisibility} />
                                        <label className="form-check-label" htmlFor="showPasswordCheckbox">Show Password</label>
                                    </div>
                                    <big>비밀번호 재확인</big>
                                    <div className="input-group has-validation mb-3">
                                        <span className="input-group-text border">PW</span>
                                        <div className="form-floating is-valid flex-grow-1">
                                            <input type='password' className="form-control is-valid" placeholder="비밀번호 확인" />
                                            <label>PassWord Re</label>
                                        </div>
                                        <div className="invalid-feedback">
                                            입력하신 비밀번호와 일치하지 않습니다
                                        </div>
                                    </div>
                                </div>
                            )}





                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary" onClick={() => {
                                // 여기에서 회원가입 요청 로직을 구현합니다.
                                sendData();
                                alert("가입 요청을 처리합니다!");
                            }}>가입하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;