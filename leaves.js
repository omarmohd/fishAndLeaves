
const margin = { top: 90, right: 100, bottom: 100, left: 0 }
const width = 1800
const height = 795
let pos = 0 // position
let first = true // first start position
const duration = 4000

const scaleX = d3.scaleLinear()
    .domain([0, 50])
    .range([0, width - margin.right - margin.left]);

const scaleY = d3.scaleLinear()
    .domain([0, 50])
    .range([0, height - margin.bottom - margin.top]);

d3.json("Data/dataset.json")
    .then(dataset => {

        let createSvg = () =>
            d3.select("body").append("svg")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        const onClickLeaf = (ds) => {
            setPointerEvents("none") // leaves are no longer clickable until the transition is complete
            first = false // it's not first start position anymore
            if (pos == 2) {
                pos = -1
            }
            pos++
            drawLeaves(ds)
            drawFishes(ds)
            setTimeout(function () { setPointerEvents("auto") }, duration + 3500)
        }

        function setPointerEvents(pointerEvents) {
            return svg.selectAll(".leaf").select('#leaf').attr("pointer-events", pointerEvents)
        }

        function drawLeaves(ds) {

            const leaves = svg.selectAll(".leaf").data(ds)
            leaves.exit().remove()
            const leaf = leaves.enter()
                .append('g')
                .attr('class', 'leaf')

            leaf
                .append("svg:image")
                .attr("id", "leaf")
                .attr("width", '206px')
                .attr("x", (d) => scaleX(d.x1))
                .attr("y", (d) => scaleY(d.y1))
                .attr("xlink:href", "images/leaf.svg")
                .on("click", () => onClickLeaf(ds, leaf))

            leaves.select('#leaf')
                .transition().duration(duration)
                .attr("x", (d) => pos == 1 ? scaleX(d.x2) : pos == 2 ? scaleX(d.x3) : scaleX(d.x1))
                .attr("y", (d) => pos == 1 ? scaleY(d.y2) : pos == 2 ? scaleY(d.y3) : scaleY(d.y1))
        }

        function drawFishes(ds) {

            const fishes = svg.selectAll(".fish").data(ds)
            fishes.exit().remove()

            const fish = fishes.enter()
                .append('g')
                .attr('class', 'fish')

            fish
                .append("svg:image")
                .attr("id", "fish")
                .attr("x", (d) => scaleX(d.x1) + 50) // +50 for the different coordinates points of the fish compared to the leaves
                .attr("y", (d) => scaleY(d.y1) + 50)
                .attr("opacity", 0.5)
                .attr("xlink:href", "images/fish.svg")

            fishes.select('#fish') // rotation
                .transition().duration(duration - 500).delay(duration - 3500)
                .attrTween('transform', function (d) {
                    const rx = scaleX(d.x1) + 90; // used for rotation
                    const ry = scaleY(d.y1) + 80; // used for rotation
                    const tx1 = scaleX(d.x2) - scaleX(d.x1) + 50; // first x translation(+50 for the different coordinates points of the fish compared to the leaves)
                    const ty1 = scaleY(d.y2) - scaleY(d.y1) + 5; // first y translation
                    const tx2 = scaleX(d.x3) - scaleX(d.x2) + tx1; // second x translation using the first translation
                    const ty2 = scaleY(d.y3) - scaleY(d.y2) + ty1; // second y translation using the first translation
                    const tx3 = scaleX(d.x1) - scaleX(d.x3) + tx2; // third x translation using the second translation
                    const ty3 = scaleY(d.y1) - scaleY(d.y3) + ty2; // third y translation using the second translation
                    const deltaX1 = scaleX(d.x1) - scaleX(d.x2); // for the rotation angle, difference between x_fish and x_leaf
                    const deltaY1 = scaleY(d.y2) - scaleY(d.y1); // for the rotation angle, difference between y_leaf and y_fish(opposite because the y scale is top-bottom)
                    const deltaX2 = scaleX(d.x2) - scaleX(d.x3);
                    const deltaY2 = scaleY(d.y3) - scaleY(d.y2);
                    const deltaX3 = scaleX(d.x3) - scaleX(d.x1);
                    const deltaY3 = scaleY(d.y1) - scaleY(d.y3);
                    let angle1 = Math.atan2(deltaY1, deltaX1) * (180 / Math.PI); // angle(in radiants) with arcTangent and then transforms into degrees
                    angle1 = Math.sign(angle1) == 1 ? 360 - angle1 : -angle1;
                    let angle2 = Math.atan2(deltaY2, deltaX2) * (180 / Math.PI);
                    angle2 = Math.sign(angle2) == 1 ? 360 - angle2 : -angle2;
                    let angle3 = Math.atan2(deltaY3, deltaX3) * (180 / Math.PI);
                    angle3 = Math.sign(angle3) == 1 ? 360 - angle3 : -angle3;
                    if (pos == 1 && first) { // first start position // in the execution this is first 
                        return d3.interpolateString('translate(0,0) rotate(0' + ',' + rx +
                            ',' + ry + ')', 'translate(' + 0 + ',' + 0 + ')' +
                            'rotate(' + angle1 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 2) { // second position // in the execution this is third
                        return d3.interpolateString('translate(' + tx1 + ',' + ty1 + ') rotate(' + angle1 + ',' + rx +
                            ',' + ry + ')', 'translate(' + tx1 + ',' + ty1 + ')' +
                            'rotate(' + angle2 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 0) { // third position // in the execution this is fifth
                        return d3.interpolateString('translate(' + tx2 + ',' + ty2 + ') rotate(' + angle2 + ',' + rx +
                            ',' + ry + ')', 'translate(' + tx2 + ',' + ty2 + ')' +
                            'rotate(' + angle3 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 1 && !first) { // following start position // in the execution this is seventh
                        return d3.interpolateString('translate(' + tx3 + ',' + ty3 + ') rotate(' + angle3 + ',' + rx +
                            ',' + ry + ')', 'translate(' + tx3 + ',' + ty3 + ')' +
                            'rotate(' + angle1 + ',' + rx + ',' + ry + ')')
                    }
                })

            fishes.select('#fish') // translation
                .transition()
                .duration(duration).delay(duration)
                .attrTween('transform', function (d) {
                    const rx = scaleX(d.x1) + 90; // used for rotation
                    const ry = scaleY(d.y1) + 80; // used for rotation
                    const tx1 = scaleX(d.x2) - scaleX(d.x1) + 50; // first x translation(+50 for the different coordinates points of the fish compared to the leaves)
                    const ty1 = scaleY(d.y2) - scaleY(d.y1) + 5; // first y translation
                    const tx2 = scaleX(d.x3) - scaleX(d.x2) + tx1; // second x translation using the first translation
                    const ty2 = scaleY(d.y3) - scaleY(d.y2) + ty1; // second y translation using the first translation
                    const tx3 = scaleX(d.x1) - scaleX(d.x3) + tx2; // third x translation using the second translation
                    const ty3 = scaleY(d.y1) - scaleY(d.y3) + ty2; // third y translation using the second translation
                    const deltaX1 = scaleX(d.x1) - scaleX(d.x2); // for the rotation angle, difference between x_fish and x_leaf
                    const deltaY1 = scaleY(d.y2) - scaleY(d.y1); // for the rotation angle, difference between y_leaf and y_fish(opposite because the y scale is top-bottom)
                    const deltaX2 = scaleX(d.x2) - scaleX(d.x3);
                    const deltaY2 = scaleY(d.y3) - scaleY(d.y2);
                    const deltaX3 = scaleX(d.x3) - scaleX(d.x1);
                    const deltaY3 = scaleY(d.y1) - scaleY(d.y3);
                    let angle1 = Math.atan2(deltaY1, deltaX1) * (180 / Math.PI); // angle(in radiants) with arcTangent and then transforms into degrees
                    angle1 = Math.sign(angle1) == 1 ? 360 - angle1 : -angle1;
                    let angle2 = Math.atan2(deltaY2, deltaX2) * (180 / Math.PI);
                    angle2 = Math.sign(angle2) == 1 ? 360 - angle2 : -angle2;
                    let angle3 = Math.atan2(deltaY3, deltaX3) * (180 / Math.PI);
                    angle3 = Math.sign(angle3) == 1 ? 360 - angle3 : -angle3;
                    if (pos == 1 && first) { // first start position // in the execution this is second
                        return d3.interpolateString('translate(' + 0 + ',' + 0 + ') rotate(' + angle1 + ',' + rx + ',' + ry + ')',
                            'translate(' + tx1 + ',' + ty1 + ')' +
                            'rotate(' + angle1 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 2) { // second position // in the execution this is fourth
                        return d3.interpolateString('translate(' + tx1 + ',' + ty1 + ') rotate(' + angle2 + ',' + rx + ',' + ry + ')',
                            'translate(' + tx2 + ',' + ty2 + ')' +
                            'rotate(' + angle2 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 0) { // third position // in the execution this is sixth
                        return d3.interpolateString('translate(' + tx2 + ',' + ty2 + ') rotate(' + angle3 + ',' + rx + ',' + ry + ')',
                            'translate(' + tx3 + ',' + ty3 + ')' +
                            'rotate(' + angle3 + ',' + rx + ',' + ry + ')')
                    }
                    if (pos == 1 && !first) { // following start position // in the execution this is eighth
                        return d3.interpolateString('translate(' + tx3 + ',' + ty3 + ') rotate(' + angle1 + ',' + rx + ',' + ry + ')',
                            'translate(' + tx1 + ',' + ty1 + ')' +
                            'rotate(' + angle1 + ',' + rx + ',' + ry + ')')
                    }
                })
        }
        let svg = createSvg()
        drawFishes(dataset)
        drawLeaves(dataset)
    })

    .catch(error => {
        console.log(error)
    })