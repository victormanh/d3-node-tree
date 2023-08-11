import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import * as d3 from "d3";
import { fromEvent } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';

@Component({
  selector: 'd3noob-collapsible-tree',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TreeViewComponent implements AfterViewInit {

  @Input() set treeData(value: any) {
    this._treeData = value;
    this.maxDepth = this.depthOfTree(this._treeData);
  }
  get treeData(): any {
    return this._treeData;
  }

  @Input() duration = 750;
  @Input() height = 400;

  @ViewChildren('label') labelsDiv?: QueryList<ElementRef>;
  @ViewChild('wrapper', { static: true }) wrapper?: ElementRef;

  private _treeData: any;
  private width = 0;
  private svg: any;
  private root: any;
  private maxDepth = 0;
  public labels: string[] = [];
  private margin = { right: 100, left: 100 };
  private i = 0;
  private treemap: any;
  private firstLabel: any;
  private lastLabel: any;

  public size$ = fromEvent(window, 'resize').pipe(
    debounceTime(300),
    map((event: Event) => (event.target as Window).innerWidth),
    tap((innerWidth) => {
      this.updateSize();
      this.update(this.root);
    })
  );

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    this.firstLabel = this.labelsDiv?.first.nativeElement;
    this.lastLabel = this.labelsDiv?.reduce((prev: any, curr: any) =>
      (prev.nativeElement as HTMLElement).getBoundingClientRect().width <
        (curr.nativeElement as HTMLElement).getBoundingClientRect().width ? curr : prev,
      this.labelsDiv?.first
    )?.nativeElement;

    this.svg = d3.select('#tree').select('svg');
    this.svg.attr('preserveAspectRatio', 'xMidYMid meet').append('g');

    this.treemap = d3.tree().size([this.height, 100]);

    this.root = d3.hierarchy(this.treeData, (d: any) => d.children);
    this.updateSize();

    setTimeout(() => {
      this.root.children.forEach((d: any) => this.collapse(d));
      this.update(this.root);
    });
  }

  depthOfTree(ptr: any, maxdepth: number = 0): number {
    if (ptr == null || !ptr.children) return maxdepth;
    this.labels.push(ptr.name);
    for (const it of ptr.children) {
      maxdepth = Math.max(maxdepth, this.depthOfTree(it));
    }
    return maxdepth + 1;
  }

  updateSize() {
    this.margin.left = this.firstLabel.getBoundingClientRect().width + 25;
    this.margin.right = this.lastLabel.getBoundingClientRect().width + 50;
    this.width = this.wrapper?.nativeElement.getBoundingClientRect().width;

    const availableHeight = window.innerHeight - 0
    this.height = Math.min(availableHeight, this.height);

    this.svg
      .attr('width', this.width + 'px')
      .attr('height', this.height + 'px')
      .attr('viewBox', `${-this.margin.left} 0 ${this.width} ${this.height}`);
  }
  update(source: any) {
    this.root.x0 = this.height / 2;
    this.root.y0 = 0;

    // Assigns the x and y position for the nodes
    const treeData = this.treemap(this.root);

    // Compute the new tree layout.
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    const height =
      links.map((x: any) => x.x).reduce((a: any, b: any) => (b > a ? b : a), 0) + 50;
    this.height = height > this.height ? height : this.height;
    this.svg.attr('height', this.height + 'px');
    let step =
      (this.width - this.margin.left - this.margin.right) / this.maxDepth;
    let innerMargin = 0;
    if (step > this.lastLabel.getBoundingClientRect().width + 100) {
      step = this.lastLabel.getBoundingClientRect().width + 100;
      innerMargin = (this.width - step * this.maxDepth - this.margin.left - this.margin.right - 10) / 2;
    }

    const spacing = this.height / (this.maxDepth + 1);
    // Normalize for fixed-depth.
    nodes.forEach((d: any) => {
      d.y = d.depth * step + innerMargin;
    });



    // // Normalize for fixed-depth and adjust y position based on spacing
    // nodes.forEach((d: any) => {
    //   d.y = d.depth * spacing;
    // });

    // ****************** Nodes section ***************************

    // Update the nodes...
    const node = this.svg.selectAll('g.node').data(nodes, (d: any) => {
      return d.id || (d.id = ++this.i);
    });

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => {
        return 'translate(' + source.y0 + ',' + source.x0 + ')';
      })
      .on('click', (_: any, d: any) => this.click(d));

    // Add Circle for the nodes
    nodeEnter
      .append('circle')
      .attr('class', (d: any) => (d._children ? 'node fill' : 'node'))
      .attr('r', 1e-6);
    // Add labels for the nodes
    nodeEnter
      .append('text')
      .attr('text-rendering', 'optimizeLegibility')
      .attr('dy', '.35em')

      .attr('cursor', (d: any) => (d.children || d._children ? 'pointer' : 'auto'))
      .attr('x', (d: any) => {
        return d.children || d._children ? -13 : 13;
      })
      .attr('text-anchor', (d: any) => {
        return d.children || d._children ? 'end' : 'start';
      })
      .text((d: any) => {
        return d.data.name;
      });
    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    // Update the node attributes and style
    nodeUpdate
      .select('circle.node')
      .attr('r', 10)
      .attr('class', (d: any) => (d._children ? 'node fill' : 'node'))
      .attr('cursor', (d: any) => (d.children || d._children ? 'pointer' : 'auto'));

    // Remove any exiting nodes
    const nodeExit = node
      .exit()
      .transition()
      .duration(this.duration)
      .attr('transform', (d: any) => {
        return 'translate(' + source.y + ',' + source.x + ')';
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle').attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text').style('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    const link = this.svg.selectAll('path.link').data(links, (d: any) => {
      return d.id;
    });

    // Enter any new links at the parent's previous position.
    const linkEnter = link
      .enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal(o, o);
      });

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate
      .transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        return this.diagonal(d, d.parent);
      });

    // Remove any exiting links
    const linkExit = link
      .exit()
      .transition()
      .duration(this.duration)
      .attr('d', (d: any) => {
        const o = { x: source.x, y: source.y };
        return this.diagonal(o, o);
      })
      .remove();

    // Store the old positions for transition.
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
    const svg = d3.select('svg');
  }

  collapse(d: any) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((d: any) => this.collapse(d));
      d.children = null;
    }
  }

  click(d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    setTimeout(() => {
      this.update(d);
    });
  }

  diagonal(s: any, d: any) {
    const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;

    return path;
  }
}
