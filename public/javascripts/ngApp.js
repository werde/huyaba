var app = angular.module('huyaba', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider)
	{
		$stateProvider.state('index',
		{
			url: '/index',
			templateUrl: '/index.html',
			controller: 'IndexCtrl',
			resolve: {
				boardsResolve: ['boards', function(boards)
				{
					return boards.getBoards();
				}]
			}
		})

		$stateProvider.state('board',
		{
			url: '/{board}/',
			templateUrl: '/board.html',
			controller: 'BoardCtrl',
			resolve: {
				postsResolve: ['$stateParams', 'posts', function($stateParams, posts)
				{
					return posts.getThreads($stateParams.board);
				}]
			}
		})

		$stateProvider.state('thread',
		{
			url: '/{board}/{thread}',
			templateUrl: '/thread.html',
			controller: 'ThreadCtrl',
			resolve: {
				p: ['$stateParams', 'posts', function($stateParams, posts)
				{
					console.log($stateParams.board + " " + $stateParams.thread)
					return posts.getThread($stateParams.board, $stateParams.thread);
				}]
			}
		})

		$urlRouterProvider.otherwise('index');
	}
])

app.factory('boards', ['$http', '$stateParams',
	function($http, $stateParams)
	{
		var o = {boards: []};

		o.getBoards = function()
		{
			return $http.get('/boards').success(function(data)
			{
				angular.copy(data, o.boards)
			})
		}

		o.currentBoard = function()
		{
			return $stateParams.board;
		}

		return o;
	}
])

app.factory('posts', ['$http', '$stateParams', 'fileUpload',  function($http, $stateParams, fileUpload)
	{
		var o = {posts: []};

		o.getThreads = function(board)
		{
			return $http.get('/' + board).success(function(data)
			{
				angular.copy(data, o.posts);
			})
		}

		o.getThread = function(board, threadId)
		{
			return $http.get('/' + board + '/' + threadId).success(function(data)
			{
				angular.copy(data, o.posts);
			})
		}

		o.newThread = function(thread, board)
		{
			return $http.post('/' + board, thread).success(function(data)
			{
				o.posts.push(data);
			})
		}

		o.newPostWithImages = function(board, post, threadId)
		{
			threadId = threadId || "";
			if (!post) post = {};
			post.mail = post.mail || "";
			post.author = post.author || "anonymous";
			post.title = post.title || "";
			post.body = post.body || "";

			//var file = $scope.imageFile;
			var file = fileUpload.getFileQueue();

			/* Form data */
			var fd = new FormData();
			for (var f in file)
			{
				if (file[f].serverName)
					fd.append('file', file[f], file[f].serverName);
				else
					fd.append('file', file[f]);
			}

			fd.append('mail', post.mail);
			fd.append('author', post.author);
			fd.append('title', post.title);
			fd.append('body', post.body);

			return $http.post('/' + board + "/" + threadId, fd, 
			{
				transformRequest: angular.identity, 
				headers: {'Content-Type': undefined}
			}).success(function(data)
			{
				if (o.posts)
					o.posts.push(data);
				else 
					o.threads.push(data);
			}).error(function()
			{
				console.log("fileUpload error");
			});
		}

		o.newPost = function(threadId, board, post)
		{
			return $http.post('/' + board + '/' + threadId, post).success(function(data)
			{
				o.posts.push(data);
			})
		}

		o.currentThread = function()
		{
			return $stateParams.thread;
		}

		return o;
	}
])

app.directive('fileModel', ['$parse', '$filter', 'fileUpload', 'imageService', function ($parse, $filter, fileUpload, imageService) 
{
	var validFormats = ['jpg', 'gif', 'png', 'jpeg'];
	return {
		restrict: 'A',
		link: function(scope, element, attrs, ctrl) 
		{
			var model = $parse(attrs.fileModel);
			var isMultiple = attrs.multiple;
			var modelSetter = model.assign;

			element.bind('change', function()
			{
				scope.$apply(function()
				{
					if (isMultiple)
					{
						modelSetter(scope, element[0].files);
					} else 
					{
						modelSetter(scope, element[0].files[0]);
					}
				});

				//**TODO
				//!! get element.onchange and call it with subsequent code
				var files = [];

				angular.forEach(scope.imageFile, function(file, index)
				{
					//check if not images or too big
					var ext = file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase();
					console.log(index + " "+ ext);
					if ((validFormats.indexOf(ext) !== -1)&&(file.size <=  9000000))
					{
						files.push(file);
					}
				})

				//check file count
				var fileQueueLength = fileUpload.getFileQueue().length;
				var filesLength = files.length;
				if (fileQueueLength + filesLength*2 > 8) return;

				//queue files
				if (fileUpload.queueFiles(files) == false) return;

				//preview
				document.getElementById('empty-file-queue').style.display = "block";
				angular.forEach(files, function(file)
				{
					console.log(file);
					imageService.resize(file, 80, 80, function(blob)
					{
						var fileOfBlob = new File([blob], blob.name);
						fileUpload.getFileQueue().push(fileOfBlob);
						imageService.appendImageToElement(document.getElementById("preview"), blob);
						var temp = fileUpload.getFileQueue();
						console.log(blob);
						console.log("FileQueue length" + temp.length);
					});
				})
			});
		}
	};
}]);

app.service('fileUpload', ['$http', function ($http) 
	{
		var fileQueue = [];

		this.getFileQueue = function()
		{
			return fileQueue;
		}

		/*
		this.queueFiles = function(files)
		{
			i = 0;
			j = files.length;
			var file, reader;

			reader = new FileReader();
			reader.onloadend = function() 
			{
				fileQueue.push(reader.result);
			};

			for (i = 0; i < j; i += 1) 
			{
				file = files[i];
				file.serverName = (new Date()).getTime() + "." + file.name.split(".").slice(-1)[0];
				reader.readAsBinaryString(file);
			}
		}
		*/

		this.queueFiles = function(files)
		{
			if ((fileQueue.lenght + files.length) > 4) return false;
			angular.forEach(files, function(file)
			{
				var r = Math.floor(Math.random() * 10000);
				file.serverName = (new Date()).getTime() + r + "." + file.name.split(".").slice(-1)[0];
				fileQueue.push(file);
			})
		}

		this.cleanQueue = function()
		{
			console.log("this.cleanQueue");
			fileQueue = [];
			document.getElementById('empty-file-queue').style.display = "none";

			var imgsDiv = document.getElementById('preview');
			while (imgsDiv.hasChildNodes())
    			imgsDiv.removeChild(imgsDiv.firstChild);
		}

		this.deleteElement = function()
		{
			//
		}

		this.uploadFileToUrl = function(file, uploadUrl)
		{
			var fd = new FormData();

			for (var f in file)
				fd.append('file', file[f]);

			$http.post(uploadUrl, fd, 
			{
				transformRequest: angular.identity,
				headers: {'Content-Type': undefined}
			}).success(function()
			{
				console.log("fileUpload success ");
			}).error(function()
			{
				console.log("fileUpload error");
			});
		}
	}
]);

app.service('imageService', ['$http', function($http)
	{
		function dataURItoBlob(dataURI) 
		{
			var binary = atob(dataURI.split(',')[1]);
			var array = [];
			for(var i = 0; i < binary.length; i++) 
			{
				array.push(binary.charCodeAt(i));
			}
			return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
		}

		this.resize = function(file, maxWidth, maxHeight, cb)
		{
			var img = document.createElement("img");
			var canvas = document.createElement("canvas");
			img.src = window.URL.createObjectURL(file);

			img.onload = function()
			{
				var width = img.naturalWidth;
				var height = img.naturalHeight;

				if (width > height) 
				{
					if (width > maxWidth) 
					{
						height *= maxWidth / width;
						width = maxWidth;
					}
				} else 
				{
					if (height > maxHeight) 
					{
						width *= maxHeight / height;
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;

				var ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height);

				//var sFile = canvas.mozGetAsFile("foo.png");
				var sDataUrl = canvas.toDataURL("image/png");
				sDataUrl.name = "s" + file.name.split(".")[0] + ".png"
				var blob = dataURItoBlob(sDataUrl);
				blob.name = "s" + file.serverName.split(".")[0] + ".png" ;
				cb(blob);
			}
		}

		this.appendImageToElement = function(element, file)
		{
			var img = document.createElement("img");
			img.src = window.URL.createObjectURL(file);
			element.appendChild(img);
		}
	}
])


app.controller('IndexCtrl', [
	'$scope',
	'boards',
	function($scope, boards)
	{
		$scope.boards = boards.boards;
	}
])

app.controller('BoardCtrl', [
	'$scope',
	'posts',
	'boards',
	'fileUpload',
	'imageService',
	function($scope, posts, boards, fileUpload, imageService)
	{
		$scope.board = boards.currentBoard();
		$scope.threads = posts.posts;

		$scope.emptyFileQueue = function()
		{
			fileUpload.cleanQueue();
		}

		$scope.newThread = function()
		{
			posts.newPostWithImages($scope.board, $scope.thread);
		}

		$scope.uploadClick = function()
		{
			var el = document.getElementById('form-input-images');
			el.click();
		}

		$scope.onchange = function()
		{
			/*
			var files = $scope.imageFile;

			fileUpload.queueFiles(files);

			angular.forEach(files, function(file)
			{
				console.log(file);
				imageService.resize(file, 80, 80, function(blob)
				{
					fileUpload.getFileQueue().push(blob);
					imageService.appendImageToElement(document.getElementById("preview"), blob);
					var temp = fileUpload.getFileQueue();
					console.log(blob);
					console.log(temp.length);
				});
			})
			*/
		}
	}
])

app.controller('ThreadCtrl', [
	'$scope',
	'posts',
	'boards',
	'fileUpload',
	'imageService',
	function($scope, posts, boards, fileUpload, imageService)
	{
		$scope.posts = posts.posts;
		$scope.board = boards.currentBoard();
		$scope.thread = posts.currentThread();

		$scope.emptyFileQueue = function()
		{
			fileUpload.cleanQueue();
		}

		$scope.newPost = function()
		{
			posts.newPostWithImages($scope.board, $scope.post, $scope.thread);
		}

		$scope.uploadClick = function()
		{
			var el = document.getElementById('form-input-images');
			el.click();
		}

		$scope.onchange = function()
		{
		}
	}
])