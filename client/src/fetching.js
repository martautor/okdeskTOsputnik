// import {useState, useEffect} from 'react'
export default async function Fetching(fID, lID) {
     return fetch(`http://${process.env.fullAddress}/api/start/?firstId=${fID}&lastId=${lID}`, {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }
    })
}