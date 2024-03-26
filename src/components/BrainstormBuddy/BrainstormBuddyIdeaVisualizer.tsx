import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BrainstormBuddyIdeaVisualizerProps {
  ideas: any[];
}

const BrainstormBuddyIdeaVisualizer: React.FC<
  BrainstormBuddyIdeaVisualizerProps
> = ({ ideas }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

      // Clear previous visualization
      svg.selectAll("*").remove();

      // Create a force simulation for the ideas
      const simulation = d3
        .forceSimulation(ideas)
        .force(
          "link",
          d3.forceLink().id((d: any) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force(
          "center",
          d3.forceCenter(
            svg.node()!.getBoundingClientRect().width / 2,
            svg.node()!.getBoundingClientRect().height / 2
          )
        );

      // Create links between related ideas
      const link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(ideas.filter((d) => d.related))
        .enter()
        .append("line")
        .attr("stroke-width", 2)
        .attr("stroke", "gray");

      // Create nodes for each idea
      const node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(ideas)
        .enter()
        .append("circle")
        .attr("r", 20)
        .attr("fill", (d) => getColorByType(d.type))
        .call(drag(simulation) as any);

      // Append text labels to each node
      const label = svg
        .append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(ideas)
        .enter()
        .append("text")
        .text((d) => d.text)
        .attr("font-size", 12)
        .attr("dx", 15)
        .attr("dy", 4);

      // Update the positions of nodes and links on each simulation tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

        label.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
      });
    }
  }, [ideas]);

  const getColorByType = (type: string) => {
    // Define color mapping based on idea type
    switch (type) {
      case "question":
        return "blue";
      case "challenge":
        return "red";
      case "example":
        return "green";
      default:
        return "gray";
    }
  };

  const drag = (simulation: d3.Simulation<any, undefined>) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };

  return <svg ref={svgRef} width="100%" height="600px" />;
};

export default BrainstormBuddyIdeaVisualizer;
