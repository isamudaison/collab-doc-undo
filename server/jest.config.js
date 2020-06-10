module.exports = {
	rootDir: "./",
  	roots: ["<rootDir>/app/test","<rootDir>/app"],
	"testMatch": [
	  "**/__tests__/**/*.+(ts|tsx|js)",
	  "**/?(*.)+(spec|test).+(ts|tsx|js)"
	],
	"transform": {
	  "^.+\\.(ts|tsx)$": "ts-jest"
	}	
  }