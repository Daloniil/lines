import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import useScrollDetect from "../Scroll";

const test = {
    sources: ['ISE', 'ACI_1', 'ACI_2', 'ACI_3', 'AWS_1', 'AWSDDDDDDD_2', 'GSP'],
    destinations: ['ACI_1', 'ACI_3', 'ACI_2', 'Meraki_1', 'SXP_SPEAKER'],
    domains: ['Default SXP Domain', 'SXP Domain 1', 'SXP Domain 2'],
    direction: [{
        source: 'ISE',
        domain: 'Default SXP Domain',
        destination: 'ACI_1',
        status: true
    },{
        source: 'ISE',
        domain: 'Default SXP Domain',
        destination: 'ACI_3',
        status: false
    }, {
        source: 'ISE',
        domain: 'SXP Domain 2',
        destination: 'SXP_SPEAKER',
        status: false
    }, {
        source: 'ACI_1',
        domain: 'SXP Domain 1',
        destination: 'ACI_1',
        status: true
    }, {
        source: 'ACI_2',
        domain: 'SXP Domain 1',
        destination: 'ACI_2',
        status: false
    }, {
        source: 'ACI_3',
        domain: 'SXP Domain 2',
        destination: 'Meraki_1',
        status: false
    }, {
        source: 'AWS_1',
        domain: 'SXP Domain 2',
        destination: 'ACI_2',
        status: true
    }, {
        source: 'AWSDDDDDDD_2',
        domain: 'SXP Domain 2',
        destination: 'SXP_SPEAKER',
        status: false
    }
    ]
}
export const Filters = () => {
    const sourcesRefs = useRef([]);
    const domainsRefs = useRef([]);
    const destinationsRefs = useRef([]);

    const addSourceRef = (el) => {
        sourcesRefs.current.push(el);
    };

    const addDomainRef = (el) => {
        domainsRefs.current.push(el);
    };

    const addDestinationRef = (el) => {
        destinationsRefs.current.push(el);
    };

    const drawLines = (directions, sourcesCordState, domainsCordState, destinationsCordState) => {
        const svg = d3.select(document.querySelectorAll('div svg')[0]);

        const defs = svg.append("defs");

        defs
            .append("marker")
            .attr("id", "dot")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 5)
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .append("circle")
            .attr("cx", 5)
            .attr("cy", 5)
            .attr("r", 5)
            .style("fill", "black");

        defs
            .append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 10)
            .attr("refY", 5)
            .attr("markerWidth", 4)
            .attr("markerHeight", 4)
            .attr("orient", "auto-start-reverse")
            .append("path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z")
            .style("fill", "black");

        const link = d3.linkHorizontal()
            .x(d => d.x)
            .y(d => d.y);

        directions.forEach((direction) => {
            const sourceCord = sourcesCordState.find((src) => src.title === direction.source)?.cord;
            const domainCord = domainsCordState.find((dom) => dom.title === direction.domain);
            const destinationCord = destinationsCordState.find((dest) => dest.title === direction.destination)?.cord;
            const color = direction.status ? "#b3cce7" : "#d7d9da";

            if (sourceCord && domainCord && destinationCord) {
                const points1 = {
                    source: {x: sourceCord.x, y: sourceCord.y},
                    target: {x: domainCord.leftCenter.x, y: domainCord.leftCenter.y}
                };

                svg
                    .append("path")
                    .attr("d", link(points1))
                    .attr("stroke", color)
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("marker-start", "url(#dot)")
                    .attr("marker-end", "url(#arrow)");

                const points2 = {
                    source: {x: domainCord.rightCenter.x, y: domainCord.rightCenter.y},
                    target: {x: destinationCord.x, y: destinationCord.y}
                };

                svg
                    .append("path")
                    .attr("d", link(points2))
                    .attr("stroke", color)
                    .attr("stroke-width", 2)
                    .attr("fill", "none")
                    .attr("marker-start", "url(#dot)")
                    .attr("marker-end", "url(#arrow)");
            } else {
                console.log("Skipped drawing line due to missing coordinates");
            }
        });
    };


    const findCord = () => {
        const sourcesCord = sourcesRefs.current.map((ref, index) => {
            const rect = ref.getBoundingClientRect();
            return {
                title: test.sources[index],
                cord: {x: rect.left + rect.width, y: rect.top + rect.height / 2}
            };
        });

        const domainsCord = domainsRefs.current.map((ref, index) => {
            const rect = ref.getBoundingClientRect();

            const leftCenter = {
                x: rect.left,
                y: rect.top + rect.height / 2
            };

            const rightCenter = {
                x: rect.left + rect.width,
                y: rect.top + rect.height / 2
            };

            return {
                title: test.domains[index],
                leftCenter: leftCenter,
                rightCenter: rightCenter
            };
        });

        const destinationsCord = destinationsRefs.current.map((ref, index) => {
            const rect = ref.getBoundingClientRect();
            return {
                title: test.destinations[index],
                cord: {x: rect.left, y: rect.top + rect.height / 2}
            };
        });

        drawLines(test.direction, sourcesCord, domainsCord, destinationsCord);
    }


    useEffect(() => {
        findCord()
    }, []);


    useScrollDetect(
        () => {
            const svg = d3.select(document.querySelectorAll('div svg')[0]);
            svg.selectAll("*").remove();

        },
        () => findCord()
    );

    return (
        <>
            <svg style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 1,
                width: "100%",
                height: "100%",
                pointerEvents: 'none',
            }}></svg>
            <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", height: "100vh"}}>

                <div style={{marginRight: "20px", display: "flex", flexDirection: "column", minHeight: "100px"}}>
                    SORCES
                    {test.sources.map((source, index) => (
                        <p key={index} ref={addSourceRef}
                           style={{display: 'inline-block', padding: '0 10px 0 10px'}}>{source}</p>
                    ))}
                </div>

                INGRES FILTER

                <div style={{
                    marginRight: "20px",
                    marginLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "100px"
                }}>
                    SXP DOMAINS
                    {test.domains.map((domain, index) => (
                        <p key={index} ref={addDomainRef}
                           style={{display: 'inline-block', padding: '0 10px 0 10px'}}>{domain}</p>
                    ))}
                </div>

                INGRES FILTER

                <div style={{marginLeft: "20px", display: "flex", flexDirection: "column", minHeight: "100px"}}>
                    DESTINATIONS
                    {test.destinations.map((destination, index) => (
                        <p key={index} ref={addDestinationRef}
                           style={{display: 'inline-block', padding: '0 10px 0 10px'}}>{destination}</p>
                    ))}
                </div>

            </div>

        </>

    );
};