export class ProductionEdge {
	source: string;
	target: string;
	quantitiy: number;

	public constructor(source: string, target: string, quantity: number) {
		this.source = source;
		this.target = target;
		this.quantitiy = quantity;
	}

	get id(): string {
		return `${this.source}-${this.target}`;
	}
}
