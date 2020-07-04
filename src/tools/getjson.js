/* getjson handle error as [] */
import sandInits from "../sandInits"
export default function(uri){
  return new Promise(function(resolve,reject){
    fetch(uri,sandInits)
    .then((d)=>(d.json()))
    .then(function(v){
      resolve(v)
    }).catch(function(e){
      resolve([])
    })
  })
}
