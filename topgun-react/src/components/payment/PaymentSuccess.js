import { useParams } from "react-router";
import { useRecoilValue } from "recoil";
import { loginState, userState } from "../../util/recoil";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const PaymentSuccess=()=>{
    
    const {partnerOrderId} = useParams();



    const login = useRecoilValue(loginState);
    const userLoading = useRecoilValue(userState);

    //state
    const [result, setResult] = useState(null);
    const [seatsList, setSeatsList] = useState([]);
    //effect
    useEffect(()=>{
        if(login && userLoading){
            sendApproveRequest();
        }
    }, [login, userLoading]);
    
    //callback
    const sendApproveRequest = useCallback(async()=>{
        try {
            const resp= await axios.post("http://localhost:8080/seats/approve",
                {
                    partnerOrderId : partnerOrderId , 
                    pgToken : new URLSearchParams(window.location.search).get("pg_token"),
                    tid: window.sessionStorage.getItem("tid"),
                    seatsList: JSON.parse(window.sessionStorage.getItem("checkedSeatsList"))
                }
        );
            setSeatsList(JSON.parse(window.sessionStorage.getItem("checkedSeatsList")));
            setResult(true);
        }
        catch(e){
            setResult(false);
        }
        finally{
            window.sessionStorage.removeItem("tid");
            window.sessionStorage.removeItem("checkedSeatsList");
        }
    }, [login, userLoading]);

    const total= useMemo(()=>{
        return seatsList.reduce((b, c)=>b + (c.price*c.qty), 0);
    }, [seatsList]);

    if(result===null){
        return(<>
            <h1>결제진행중</h1>
        </>);
        }
        else if(result){
            return(<>
            <div className="row mt-4">
                <div className="col">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>예약한 좌석번호</th>
                                <th>판매가</th>
                                <th>구매한 좌석수</th>
                                <th>합계</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seatsList.map(seats=>(
                                <tr key={seats.seatsNo}>
                                    <td>{seats.seatsNo}</td>
                                    <td>{seats.seatsPrice}원</td>
                                    <td>{seats.qty}좌석</td>
                                    <td>{seats.seatsPrice * seats.qty}원</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <th colSpan={3}>총 결제 금액</th>
                                <th> {total}원</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            </>);
        }
        else{
            return (<>
                <h1>결제 승인 실패</h1>
            </>)
        }

};

export default PaymentSuccess;