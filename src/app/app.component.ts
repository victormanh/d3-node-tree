import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'd3-node-tree';
  margin = { top: 0, right: 130, bottom: 0, left: 80 };
  treeData = {
    name: 'Top Level',
    children: [
        {
            name: 'Level 2: A',
            children: [
                {
                    name: 'Son of A',
                    children: [
                        { name: 'Grandchild 1 of Son of A', children: [
                            { name: 'Great Grandchild 1 of Grandchild 1' },
                            { name: 'Great Grandchild 2 of Grandchild 1' },
                        ]},
                        { name: 'Grandchild 2 of Son of A', children: [
                            { name: 'Great Grandchild 1 of Grandchild 2' },
                            { name: 'Great Grandchild 2 of Grandchild 2' },
                        ]},
                    ],
                },
                {
                    name: 'Daughter of A',
                    children: [
                        { name: 'Grandchild 1 of Daughter of A', children: [
                            { name: 'Great Grandchild 1 of Grandchild 1' },
                            { name: 'Great Grandchild 2 of Grandchild 1' },
                        ]},
                        { name: 'Grandchild 2 of Daughter of A', children: [
                            { name: 'Great Grandchild 1 of Grandchild 2' },
                            { name: 'Great Grandchild 2 of Grandchild 2' },
                        ]},
                    ],
                },
            ],
        },
        {
            name: 'Level 2: B',
            children: [
                {
                    name: 'Son of B',
                    children: [
                        { name: 'Grandchild 1 of Son of B', children: [
                            { name: 'Great Grandchild 1 of Grandchild 1' },
                            { name: 'Great Grandchild 2 of Grandchild 1' },
                        ]},
                        { name: 'Grandchild 2 of Son of B', children: [
                            { name: 'Great Grandchild 1 of Grandchild 2' },
                            { name: 'Great Grandchild 2 of Grandchild 2' },
                        ]},
                    ],
                },
                {
                    name: 'Daughter of B',
                    children: [
                        { name: 'Grandchild 1 of Daughter of B', children: [
                            { name: 'Great Grandchild 1 of Grandchild 1' },
                            { name: 'Great Grandchild 2 of Grandchild 1' },
                        ]},
                        { name: 'Grandchild 2 of Daughter of B', children: [
                            { name: 'Great Grandchild 1 of Grandchild 2' },
                            { name: 'Great Grandchild 2 of Grandchild 2' },
                        ]},
                    ],
                },
                { name: 'Son of C' },
            ],
        },
    ],
};

}
