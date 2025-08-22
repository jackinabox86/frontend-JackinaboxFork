export const dagreSetGraphConfig = {
	rankdir: "LR",
	align: "UL",
	nodesep: 50,
	ranksep: 75,
	edgesep: 50,
};

export const nodeDimensions = {
	height: 60,
	width: 60,
};

const dagreNodeSizeWidthAdd: number = 0;
const dagreNodeSizeHeightAdd: number = 0;

export const dagreSetNodeConfig = {
	width: nodeDimensions.width + dagreNodeSizeWidthAdd,
	height: nodeDimensions.height + dagreNodeSizeHeightAdd,
};
