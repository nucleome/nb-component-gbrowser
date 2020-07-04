import sandInits from "../sandInits"
export default function (link, callback) {
  fetch(link,sandInits)
    .then((d)=>(d.json()))
    .then(function(d){
      if (typeof d["Appname"] !== undefined ) {
        callback(true)
      } else {
        callback(false)
      }
    })
    .catch(function(e){
      callback(false)
    })
}
