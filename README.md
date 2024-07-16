# ghr - GitHub Runner
Run a file from a GitHub repository in your command line

### Installation
```bash
sudo npm install -g ghr
```
### Usage
```bash
ghr <user>/<repo> <branch?> <files?> <tempPath?>
```

Where `user` is the GitHub username, `repo` is the repository name, `branch` is the branch name, `files` is the file or files to download (separated by commas), and `tempPath` is the path to download the files to.

## Default Values
- `user` and `repo` are **required**
- `branch` defaults to `master`
- `files` defaults to `index.js`
- `tempPath` defaults to `~/.ghr`

### Example
```bash
ghr systemsoftware/dirtable 
```
```bash
ghr systemsoftware/dirtable master "index.js, other_file.js"
```
```bash
ghr systemsoftware/dirtable master index.js ~/temp
```
```bash
ghr systemsoftware/dirtable master index.js --c --k
```

## Remove ~/.ghr
`~/.ghr` is a directory that stores the files downloaded by ghr. To remove it, run:
```bash
ghr --clean
```
> Note: ghr will automatically attempt to remove the directory after running the repository, unless the `--keep` flag is used.

## Optional Flags
Flags can be used in any order, but must be placed after all other arguments
- `--c` or `--clear` to clear the console before running the file
- `--skip-deps` or `--sd` to skip installing dependencies
- `--keep` or `--k` to keep the directory after running the repository