// import {useState, useEffect} from 'react'
export default async function Fetching(fID, lID) {
     return fetch(`http://192.168.0.30:5000/api/start/?firstId=${fID}&lastId=${lID}`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }
    })
}