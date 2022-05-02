angular.module("demo").controller("createPilotController",function($scope){
    $scope.isMapLoaded=false;
    $('select').material_select();
    $scope.view = "view1";
    
    $scope.certificates = [];
    $scope.addCertificate = function(){
        // $scope.certificates.push($scope.row);
        $scope.certificates.push({name:$scope.cname,expiration:$scope.cdate});

    };
    $scope.changeView = function(view){
        $scope.view = view;
    };
    $scope.openView2 = function(name)
    {
        $scope.view = "view2";
        console.log(name);
    }
    document.getElementById('operatorPic').onchange = function (evt) {
        var tgt = evt.target || window.event.srcElement,
        files = tgt.files;


        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = function () {
                var width =$("#getWidthOperator").outerWidth();
                $("#getWidthOperator,#operatorPicPlaceholder").toggle();
                document.getElementById("operatorPicPlaceholder").height = width;
                document.getElementById("operatorPicPlaceholder").src = fr.result;

            }
            fr.readAsDataURL(files[0]);
        }

        else {

        }
    }

    document.getElementById('companyPic').onchange = function (evt) {
        var tgt = evt.target || window.event.srcElement,
        files = tgt.files;


        if (FileReader && files && files.length) {
            var fr = new FileReader();
            fr.onload = function () {
                var width =$("#getWidthCompany").outerWidth();
                $("#getWidthCompany,#companyPicPlaceholder").toggle();
                document.getElementById("companyPicPlaceholder").height = width;
                document.getElementById("companyPicPlaceholder").src = fr.result;

            }
            fr.readAsDataURL(files[0]);
        }

        else {

        }
    }
});
