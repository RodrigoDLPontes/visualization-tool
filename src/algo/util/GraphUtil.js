const LARGE_ALLOWED = [[false, true, true, false, true, false, false, true, false, false, false, false, false, false, true, false, false, false],
									[true, false, true, false, true, true,  false, false, false, false, false, false, false, false, false, false, false, false],
									[true, true, false, true,  false, true, true,  false, false, false, false, false, false, false, false, false, false, false],
									[false, false, true, false, false,false, true, false, false, false, true, false, false,  false, false, false, false, true],
									[true, true, false, false,  false, true, false, true, true, false, false, false, false, false, false, false,  false,  false],
									[false, true, true, false, true, false, true,   false, true, true, false, false, false, false, false, false,  false,  false],
									[false, false, true, true, false, true, false, false, false, true, true, false, false, false, false, false,  false,  false],
									[true, false, false, false, true, false, false, false, true, false, false, true, false, false, true, false, false, false],
									[false, false, false, false, true, true, false, true, false, true, false, true, true, false,   false, false, false, false],
									[false, false, false, false, false, true, true, false, true, false, true, false, true, true,  false,  false, false, false],
									[false, false, false, true, false,  false, true, false, false, true, false, false, false, true, false, false, false, true],
									[false, false, false, false, false, false, false, true, true, false, false, false, true, false, true, true, false, false],
									[false, false, false, false, false, false, false, false, true, true, false, true, false, true, false, true, true, false],
									[false, false, false, false, false, false, false, false, false, true, true, false, true, false, false, false, true, true],
									[false, false, false, false, false, false, false, true, false, false, false, true, false, false, false, true, false, false],
									[false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, true, true],
									[false, false, false, false, false, false, false, false, false, false, false, false, true, true, false, true, false, true],
									[false, false, false, false, false, false, false, false, false, false, true, false, false, true, false, true, true, false]];

const LARGE_CURVE  = [[0, 0, -0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.25, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0.4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.25],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[-0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.4],
								[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
								[0, 0, 0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -0.4, 0, 0]]



const LARGE_X_POS_LOGICAL = [600, 700, 800, 900,
										650, 750, 850,
										600, 700, 800, 900,
										650, 750, 850,
										600, 700, 800, 900];


const LARGE_Y_POS_LOGICAL = [50, 50, 50, 50,
										150, 150, 150,
										250, 250, 250, 250,
										350, 350, 350,
										450,  450, 450, 450];


const SMALL_ALLLOWED = [[false, true,  true,  true,  true,  false, false, false],
									[true,  false, true,  true,  false, true,  true,  false],
									[true,  true,  false, false, true,  true,  true,  false],
									[true,  true,  false, false, false, true,  false, true],
									[true,  false, true,  false, false,  false, true,  true],
									[false, true,  true,  true,  false, false, true,  true],
									[false, true,  true,  false, true,  true,  false, true],
									[false, false, false, true,  true,  true,  true,  false]];

const SMALL_CURVE = [[0, 0.001, 0, 0.5, -0.5, 0, 0, 0],
								[0, 0, 0, 0.001, 0, 0.001, -0.2, 0],
								[0, 0.001, 0, 0, 0, 0.2, 0, 0],
								[-0.5, 0, 0, 0, 0, 0.001, 0, 0.5],
								[0.5, 0, 0, 0, 0, 0, 0, -0.5],
								[0, 0, -0.2, 0, 0, 0, 0.001, 0.001],
								[0, 0.2, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, -0.5, 0.5, 0, 0, 0]];
                                
                                
const SMALL_X_POS_LOGICAL = [800, 725, 875, 650, 950, 725, 875, 800];
const SMALL_Y_POS_LOGICAL = [25, 125, 125, 225, 225, 325, 325, 425];

export { LARGE_ALLOWED, LARGE_CURVE, LARGE_X_POS_LOGICAL, LARGE_Y_POS_LOGICAL, SMALL_X_POS_LOGICAL, SMALL_Y_POS_LOGICAL, SMALL_ALLLOWED, SMALL_CURVE };