import code from "./dataSrcCode"
import decode from "./decode"
import addDrag from "../tools/addDrag"
//import 'jquery-ui-bundle';
export default function () {
  var tracksDiv //tracks div name;
  var del = function (el,i) {
    var k = $(el).closest("li")
    var id = code(decode(k.attr("id"))) 
    prefix[id].removeClass("in")
     .show()
    k.remove();
    inNum[i] -= 1
    _selectedBadge[i].text(inNum[i])
  }
 var out = function (el,i) {
    var k = $(el).closest("li")
    var id = code(decode(k.attr("id"))) 
    prefix[id].removeClass("in")
     .show()
    //k.remove();
    inNum[i] -= 1
    _selectedBadge[i].text(inNum[i])
  }
  /*
  var cfg = function (el) {
    var k = $(el).closest("li")
    var id = k.attr("id")
  }
  */
  var info = function (el) {
    var k = $(el).closest("li")
    var id = code(decode(k.attr("id")))
    if (!k.attr("infoToggled")) {
      k.find(".infoDiv").show();
      k.attr("infoToggled", true)
    } else {
      k.find(".infoDiv").hide();
      k.removeAttr("infoToggled");
    }
  }
  var add = function(el,i) {
    var li = $(el).closest("li")
    var cli = li.clone();
    d3.select(cli)._groups[0][0][0].__data__ = d3.select(li)._groups[0][0][0].__data__
    var d0 = d3.select(li)._groups[0][0][0].__data__
    var id = code(decode(li.attr("id")))
    li.addClass("in").hide()
    prefix[id] = li;
    cli.find(".btns").remove();
    var btns2 = $("<span class='btns btn-group'></span>")
    var delBtn2 = $("<button type='button' class='btn btn-default btn-xs delBtn glyphicon glyphicon-remove'></button>")
    var infoBtn2 = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-info-sign'></button>")
    var dragBtn2 = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-send' draggable=true style='cursor:drag'></button>")
    delBtn2.click(function (d) {
      del(this,i)
    })
    /*
    cfgBtn2.click(function (d) {
      cfg(this)
    })
    */
    infoBtn2.click(function (d) {
      info(this)
    })
    addDrag(d3.select(dragBtn2[0]),d0)
    btns2.append(delBtn2)
    //.append(cfgBtn2)
    .append(infoBtn2)
    .append(dragBtn2)
    cli.addClass("buffer")
    cli.find(".body").append(btns2)
    //console.log(  $("#" + tracksDiv))
    cli.appendTo($("#" + tracksDiv))
    inNum[i] += 1
    _selectedBadge[i].text(inNum[i])
    //addDrag(d3.select(cli[0]),d0)

    //console.log(d3.select(cli),d3.select(cli[0]),"add drag cli??")
  }
    var loadToTrack = function(i){
    return function(selection){
    selection.each(function(d){
      add($(d3.select(this).node()),i)
    })

    }
    }
  var prefix = {}
  var colors = {
    "hic": "#DD0000",
    "bigwig": "#000000",
    "bigbed": "#0000FF"
  }
  //color code TODO
  var color = function (format) {
    return colors[format] || "#777"
  }
  var initTracksDiv = function () {
    $("#" + tracksDiv).sortable({
      receive: function (e, ui) {
        ui.sender.data('copied', true);
      }
    })
  }
  var inNum = []
  var _selectedBadge = []
  var chart = function (selection) {
    selection.each(function (d,i) {
      var el = d3.select(this);
      el.selectAll("*").remove();
      el.classed("panel",true).classed("panel-default",true)
      var header = el.append("div").classed("panel-heading",true)
        
      var _k = d.prefix.split("/")
      _k.shift()
      var _prefix = _k.join("/")
      var title = header.append("div").classed("panel-title",true).append("span")
        .text(_prefix+"   ")

      /* Improve Badger */
      var _label = title.append("span").classed("label",true).style("color","#999")
            inNum.push(0)
        //TODO
        d.reset = function(){
            inNum[_i]=0;
            _selectedBadge[_i].text(inNum[_i])
        }
      _selectedBadge.push(_label.append("span"))
      _label.append("span").text("/")
      var _badge = _label.append("span")
            //.classed("badge",true)
        .text(d.tracks.length)



      var _i = i
      var o = title.append("div").style("float","right").classed("btn-group",true)
      var pbody = el.append("div").classed("panel-body",true)
      //FOLD **
      var loadBtn = o.append("button").classed("btn", true)
      .classed("btn-default", true)
      .classed("btn-xs", true)
      .classed("glyphicon", true)
      .classed("glyphicon-ok-sign", true)

      loadBtn.on("click",function(){
        ul.selectAll("li").filter(function(d){
          return !d3.select(this).classed("in") && !d3.select(this).classed("filterOut")
        }).call(loadToTrack(_i))
      })

     var infoBtn0 = o.append("button").classed("btn", true)
      .classed("btn-default", true)
      .classed("btn-xs", true)
      .classed("glyphicon", true)
      .classed("glyphicon-info-sign", true)
        var infoToggled = false
        infoBtn0.on("click",function(){
            infoToggled = !infoToggled
            infoBtn0.classed("btn-default",!infoToggled).classed("btn-success",infoToggled)
            ul.selectAll("li").each(function(d){
                var el = d3.select(this)
                if (infoToggled) {
                    el.attr("infoToggled",infoToggled)
                } else {
                    el.attr("infoToggled",null)
                }
                if (infoToggled) {
                    el.selectAll(".infoDiv").style("display", null)
                } else {
                    el.selectAll(".infoDiv").style("display", "none")
                }
            })

        })
     var ul = pbody.append("ul").attr("id", d.prefix).attr("class","tracksList")
     /* SEARCHABLE */
      var searchDiv = header.append("div").style("border-spacing","2px 2px").style("display","none").style("padding-top","10px")
      var filter = searchDiv.append("input").classed("form-control",true).classed("input-xs",true)
      var filterShow = false
      var toggleFilter = o.append("button").classed("btn", true)
      .classed("btn-default", true)
      .classed("btn-xs", true)
      .classed("glyphicon", true)
      .classed("glyphicon-search", true)
      var doFilter = function() {
        if (filterShow){
          var pattern = new RegExp(filter.node().value)
          ul.selectAll("li").filter(function(d){
              var k = !pattern.test(d.id)
              if ("longLabel" in d) {
                  k = k && !pattern.test(d.longLabel)
              }
              return k && !d3.select(this).classed("in")
          }).classed("filterOut",true).style("display","none")
          ul.selectAll("li").filter(function(d){
             var k = pattern.test(d.id)
              if ("longLabel" in d) {
                  k = k || pattern.test(d.longLabel)
              }
            return k && !d3.select(this).classed("in")
          }).classed("filterOut",false).style("display","")
        }
      }
      var rmFilter = function() {
        var pattern = new RegExp(filter.node().value)
        ul.selectAll("li").filter(function(d){
          return d3.select(this).classed("filterOut") && !d3.select(this).classed("in")
        }).classed("filterOut",false).style("display", "")
      }
      toggleFilter.on("click",function(){
        if (filterShow) {
          searchDiv.style("display","none")
          header.style("height","28px") //TODO CSS
          filterShow = false
          rmFilter()
        } else {
          searchDiv.style("display","block")
          header.style("height","60px")
          filterShow = true
          doFilter()
        }
        toggleFilter.classed("btn-success",filterShow).classed("btn-default",!filterShow)
      })
      filter.on("change",function(e){
        doFilter()
      })

      var li = ul.selectAll("li")
        .data(d.tracks)
        .enter()
        .append("li")
        .attr("id", function (d0) {
          d0.prefix = d.prefix;
          var server = d0.server || d.server;
          if (server) {
            d0.server = server
          }
          var el = d3.select(this)
          el.on("submit",function(d){
              add(el.node(),_i)
          })
          el.on("out",function(d){
                out(el.node(),_i)
          })
          el.on("rm",function(d){
                del(el.node(),_i)
          })
          //addDrag(d3.select(this),d0)
          return code(d0)
        })
      var liHead = li.append("div").style("width", "55px").style("height", "2px") //.style("float","left")

      liHead.style("background-color", function (d) {
        return color(d.format)
      })

      var liBody = li.append("div").classed("body", true).style("height","24px")
      liBody.append("span").classed("trackLiName",true).text(function (d) {
        //console.log("TODO Debug",d,d.id)
        return d.id
      })
      var btns = liBody.append("span").classed("btns", true).classed("btn-group",true)

      var infoDiv = li.append("div").classed("infoDiv", true).style("display", "none").style("color","#555")

      infoDiv.html(function(d){
          /*
          if("longLabel" in d){
              return d.longLabel
          } else {
              return d.server+" "+d.id
          }
          */
            var p = ""
                if ("longLabel" in d) {
                    p = "<div>"+d.longLabel+"</div>"
                } else {
                    p = "<div>"+d.server + " " + d.id+"</div>"
                }
                if ("metaLink" in d) {
                    p += "<div><a href=\""+d.metaLink+"\" target='_blank'>Read More...</a></div>"
                }

                return p
           
    })

      var addBtn = btns.append("button")
        .classed("btn", true)
        .classed("btn-default", true)
        .classed("btn-xs", true)
        .classed("glyphicon", true)
        .classed("glyphicon-ok", true)


      addBtn.on("click", function (d) {
        add(this,_i)
      })

      var infoBtn = btns.append("button")
        .classed("btn", true)
        .classed("btn-default", true)
        .classed("btn-xs", true)
        .classed("glyphicon", true)
        .classed("glyphicon-info-sign", true)

      infoBtn.on("click", function (d) {
        info(this)
      })
        li.each(function(d){
            addDrag(d3.select(this),d)
        })

     /*
      $(ul.node()).sortable({
        connectWith: "#" + tracksDiv, //TODO
        helper: function (e, li) {
          var cli = li.clone();
          //cli.data("datum",li.data("datum"))
          //console.log("datum",d3.select(li).datum(),d3.select(li).data(),d3.select(li),d3.select(li)._groups[0][0][0].__data__)
          d3.select(cli)._groups[0][0][0].__data__ = d3.select(li)._groups[0][0][0].__data__
          cli.find(".btns").remove();
          var btns = $("<span class='btns'></span>")
          var addBtn = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-ok'</button>")
          addBtn.click(function (d) {
            add(this, _i) //TODO
          })
          btns.append(addBtn)
          var infoBtn = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-info-sign'></button>")
          infoBtn.click(function (d) {
            info(this)
          })
          btns.append(infoBtn)
          cli.find(".body").append(btns)
          cli.addClass("in")
            //.css("display","none")
          cli.hide()
          this.copyHelper = cli.insertAfter(li);
          this.copyLi = li;
          $(this).data('copied', false);
          var id = li.attr("id")
          var btns2 = $("<span class='btns btn-group'></span>")
          var delBtn2 = $("<button type='button' class='btn btn-default btn-xs delBtn glyphicon glyphicon-remove'></button>")
          //var cfgBtn2 = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-cog'></button>")
          var infoBtn2 = $("<button type='button' class='btn btn-default btn-xs glyphicon glyphicon-info-sign'></button>")
          delBtn2.click(function (d) {
            del(this,_i)
          })
          cfgBtn2.click(function (d) {
            cfg(this)
          })
          infoBtn2.click(function (d) {
            info(this)
          })
          btns2.append(delBtn2)
              //.append(cfgBtn2)
              .append(infoBtn2)
          li.addClass("buffer")
          li.find(".btns").remove();
          li.find(".body").append(btns2)
          prefix[id] = cli;
          return li;
        },
        stop: function () {
          var copied = $(this).data('copied');
          if (!copied) {
            this.copyHelper.removeClass("in").show()
            //this.copyLi.removeClass("in").show()
            this.copyLi.remove()
          } else {
            //add(this.copyHelper, _i)
          }
          this.copyHelper = null;
        },
      })
      */
      /*
      el.select(".panel-body").select("ul").selectAll(".in").each(function(d){
            inNum[_i] += 1
      })
      */
      //console.log(_i,inNum[_i],el.select(".panel-body:nth-child(1)"))
    　// Add Dragable Here ???
      
      _selectedBadge[_i].text(inNum[_i])
    })
  }
  /* init hide the selected entries */
  /*
  chart.addTo = function(d,el){

  }
  */
  chart.prefix = function(_) { return arguments.length ? (prefix= _, chart) : prefix; } //get prefix.
  chart.tracksDiv = function (_) {
    return arguments.length ? (tracksDiv = _, initTracksDiv(), chart) : tracksDiv;
  }
  return chart
}
